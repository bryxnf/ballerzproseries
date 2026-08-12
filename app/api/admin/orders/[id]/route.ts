import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

type UpdateOrderRequest = {
  paymentStatus?: string;
  orderStatus?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
};

const allowedPaymentStatuses = [
  "awaiting_verification",
  "paid",
  "payment_issue",
  "refunded",
] as const;

const allowedOrderStatuses = [
  "awaiting_payment",
  "confirmed",
  "in_production",
  "ready_to_ship",
  "shipped",
  "completed",
  "cancelled",
] as const;

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /*
     * Check the user's Supabase session using the cookies sent with
     * this request.
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    /*
     * Being signed in is not enough. Confirm that this user is one
     * of the approved admin accounts.
     */
    const adminEmails = getAllowedAdminEmails();
    const userEmail = user.email?.trim().toLowerCase();

    if (
      !userEmail ||
      adminEmails.length === 0 ||
      !adminEmails.includes(userEmail)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to manage orders." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "Invalid order ID." },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: existingOrderError } =
      await supabaseAdmin
        .from("orders")
        .select("id, payment_status, inventory_adjusted")
        .eq("id", orderId)
        .single();

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateOrderRequest;
    const updates: Record<string, string | null> = {};

    if (body.paymentStatus !== undefined) {
      if (
        !allowedPaymentStatuses.includes(
          body.paymentStatus as
            (typeof allowedPaymentStatuses)[number]
        )
      ) {
        return NextResponse.json(
          { error: "Invalid payment status." },
          { status: 400 }
        );
      }

      updates.payment_status = body.paymentStatus;
    }

    if (body.orderStatus !== undefined) {
      if (
        !allowedOrderStatuses.includes(
          body.orderStatus as
            (typeof allowedOrderStatuses)[number]
        )
      ) {
        return NextResponse.json(
          { error: "Invalid order status." },
          { status: 400 }
        );
      }

      updates.order_status = body.orderStatus;
    }

    if (body.shippingCarrier !== undefined) {
      updates.shipping_carrier =
        body.shippingCarrier.trim() || null;
    }

    if (body.trackingNumber !== undefined) {
      updates.tracking_number =
        body.trackingNumber.trim() || null;
    }

    if (body.orderStatus === "shipped") {
      updates.shipped_at = new Date().toISOString();
    } else if (
      body.orderStatus !== undefined &&
      body.orderStatus !== "shipped"
    ) {
      updates.shipped_at = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates were provided." },
        { status: 400 }
      );
    }
    

    const shouldAdjustInventory =
      body.paymentStatus === "paid" &&
      existingOrder.payment_status !== "paid" &&
      !existingOrder.inventory_adjusted;

    if (shouldAdjustInventory) {
      const { data: items, error: itemsError } =
        await supabaseAdmin
          .from("order_items")
          .select(`
            id,
            item_type,
            quantity,
            configuration
          `)
          .eq("order_id", orderId);

      if (itemsError) {
        console.error(
          "Could not load order items for inventory:",
          itemsError
        );

        return NextResponse.json(
          { error: "Could not update inventory." },
          { status: 500 }
        );
      }

      const prebuiltItems =
        items?.filter(
          (item) => item.item_type === "prebuilt"
        ) ?? [];

      for (const item of prebuiltItems) {
        const configuration =
          item.configuration as
            | { prebuiltSlug?: string }
            | null;

        const slug = configuration?.prebuiltSlug;

        if (!slug) {
          console.warn(
            "Prebuilt item is missing prebuiltSlug:",
            item.id
          );

          continue;
        }

        const { data: stockUpdated, error: stockError } =
          await supabaseAdmin.rpc(
            "decrease_prebuilt_stock",
            {
              product_slug: slug,
              amount: Number(item.quantity),
            }
          );

        if (stockError || !stockUpdated) {
          console.error(
            "Inventory update failed:",
            stockError
          );

          return NextResponse.json(
            {
              error: `Not enough inventory for ${slug}.`,
            },
            { status: 409 }
          );
        }
      }

      const { error: adjustedError } =
        await supabaseAdmin
          .from("orders")
          .update({
            inventory_adjusted: true,
          })
          .eq("id", orderId);

      if (adjustedError) {
        console.error(
          "Could not mark inventory adjusted:",
          adjustedError
        );
      }
    }
    /*
     * Only after the authentication and authorization checks pass
     * do we use the secret server client.
     */
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(`
        id,
        payment_status,
        order_status,
        shipping_carrier,
        tracking_number,
        shipped_at,
        inventory_adjusted
      `)
      .single();

    if (error || !data) {
      console.error("Order status update error:", error);

      return NextResponse.json(
        { error: "The order could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order: data,
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      { error: "Invalid update request." },
      { status: 400 }
    );
  }
}