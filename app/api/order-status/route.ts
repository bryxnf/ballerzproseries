import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const orderNumber =
      searchParams.get("orderNumber")?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Enter an order number." },
        { status: 400 }
      );
    }

    if (
      orderNumber.length > 50 ||
      !orderNumber.startsWith("BPS-")
    ) {
      return NextResponse.json(
        { error: "Invalid order number." },
        { status: 400 }
      );
    }

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .select(`
          order_number,
          payment_status,
          order_status,
          shipping_carrier,
          tracking_number,
          shipped_at,
          created_at
        `)
        .eq("order_number", orderNumber)
        .maybeSingle();

    if (error) {
      console.error(
        "Order status lookup error:",
        error
      );

      return NextResponse.json(
        { error: "Order status could not be loaded." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error:
            "We could not find an order with that number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        orderNumber: order.order_number,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        shippingCarrier:
          order.shipping_carrier,
        trackingNumber:
          order.tracking_number,
        shippedAt: order.shipped_at,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error(
      "Order status route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Order status could not be loaded.",
      },
      { status: 500 }
    );
  }
}