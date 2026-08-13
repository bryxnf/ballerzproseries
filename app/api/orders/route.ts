import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { sendOrderConfirmation } from "../../../lib/email";

type CartItem = {
  id: string;
  type: "custom" | "prebuilt";
  name: string;
  price: number;
  quantity: number;
  image?: string;
  configuration?: Record<string, unknown>;
};

type OrderRequest = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;

  paymentMethod: "cashapp" | "venmo";
  paymentUsername?: string;
  customerNotes?: string;

  items: CartItem[];
};

function createOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `BPS-${timestamp}-${randomNumber}`;
}


function isDataImage(value?: string) {
  return Boolean(value?.startsWith("data:image/"));
}

function dataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
  );

  if (!match) {
    throw new Error("Invalid preview image.");
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  const extension =
    mimeType === "image/jpeg"
      ? "jpg"
      : mimeType === "image/webp"
        ? "webp"
        : "png";

  return {
    buffer,
    mimeType,
    extension,
  };
}

async function uploadCustomPreview({
  image,
  orderNumber,
  itemId,
}: {
  image: string;
  orderNumber: string;
  itemId: string;
}) {
  const { buffer, mimeType, extension } =
    dataUrlToBuffer(image);

  const safeItemId = itemId.replace(
    /[^a-zA-Z0-9-_]/g,
    "-"
  );

  const filePath =
    `${orderNumber}/${safeItemId}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("order-previews")
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Could not upload custom glove preview: ${uploadError.message}`
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("order-previews")
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (
      !body.customerName?.trim() ||
      !body.customerEmail?.trim() ||
      !body.customerPhone?.trim() ||
      !body.addressLine1?.trim() ||
      !body.city?.trim() ||
      !body.state?.trim() ||
      !body.zip?.trim() ||
      !body.paymentMethod ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Required order information is missing." },
        { status: 400 }
      );
    }

    const invalidItem = body.items.some(
      (item) =>
        !item.id ||
        !item.name ||
        !["custom", "prebuilt"].includes(item.type) ||
        typeof item.price !== "number" ||
        !Number.isFinite(item.price) ||
        typeof item.quantity !== "number" ||
        item.quantity < 1
    );

    if (invalidItem) {
      return NextResponse.json(
        { error: "One or more cart items are invalid." },
        { status: 400 }
      );
    }

    const subtotal = body.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const shippingCost = 0;
    const total = subtotal + shippingCost;
    const orderNumber = createOrderNumber();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,

        customer_name: body.customerName.trim(),
        customer_email: body.customerEmail.trim(),
        customer_phone: body.customerPhone.trim(),

        shipping_address_line_1: body.addressLine1.trim(),
        shipping_address_line_2:
          body.addressLine2?.trim() || null,
        shipping_city: body.city.trim(),
        shipping_state: body.state.trim(),
        shipping_zip: body.zip.trim(),

        payment_method: body.paymentMethod,
        payment_username:
          body.paymentUsername?.trim() || null,

        payment_status: "awaiting_verification",
        order_status: "awaiting_payment",

        subtotal,
        shipping_cost: shippingCost,
        total,

        price: total,

        customer_notes:
          body.customerNotes?.trim() || null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);

      return NextResponse.json(
        { error: "The order could not be created." },
        { status: 500 }
      );
    }

    try {
      const orderItems = await Promise.all(
        body.items.map(async (item) => {
          let permanentImage = item.image || null;

          if (
            item.type === "custom" &&
            item.image &&
            isDataImage(item.image)
          ) {
            permanentImage = await uploadCustomPreview({
              image: item.image,
              orderNumber,
              itemId: item.id,
            });
          }

          return {
            order_id: order.id,
            item_type: item.type,
            item_name: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            image: permanentImage,
            configuration: item.configuration || null,
          };
        })
      );

      const { error: itemError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemError) {
        throw new Error(itemError.message);
      }
    } catch (itemError) {
      console.error(
        "Order item or preview upload error:",
        itemError
      );

      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "The order was not completed because its items could not be saved.",
        },
        { status: 500 }
      );
    }

    if (body.customerEmail) {
      try {
        await sendOrderConfirmation({
          customerEmail: body.customerEmail,
          customerName: body.customerName,
          orderNumber: order.order_number,
          total,
        });
      } catch (emailError) {
        console.error(
          "Order confirmation email failed:",
          emailError
        );

        // Do NOT fail the order just because the email failed.
      }
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      subtotal,
      shippingCost,
      total,
    });
  } catch (error) {
    console.error("Order route error:", error);

    return NextResponse.json(
      { error: "Invalid order request." },
      { status: 400 }
    );
  }
}