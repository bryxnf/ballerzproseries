import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import { createClient } from "../../../../lib/supabase/server";
import OrderStatusEditor from "./OrderStatusEditor";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

  const userEmail = user.email?.trim().toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    redirect("/admin/login");
  }

  const orderId = Number(id);

  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Could not load order:", orderError);
    notFound();
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Could not load order items:", itemsError);
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/orders"
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            ← Back to orders
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Admin Order
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {order.order_number}
              </h1>

              <p className="mt-3 text-neutral-400">
                Created{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge
                label="Payment"
                value={order.payment_status}
              />

              <StatusBadge
                label="Order"
                value={order.order_status}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">Items</h2>

                <div className="mt-6 space-y-5">
                  {items && items.length > 0 ? (
                    items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row">
                          {item.image ? (
                            <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-white">
                              <img
                                src={item.image}
                                alt={item.item_name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {item.item_type === "custom"
                                ? "Custom Glove"
                                : "Prebuilt Glove"}
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                              {item.item_name}
                            </h3>

                            <div className="mt-3 space-y-1 text-neutral-400">
                              <p>
                                Quantity: {item.quantity}
                              </p>

                              <p>
                                Unit price: $
                                {Number(item.unit_price).toFixed(2)}
                              </p>

                              <p>
                                Line total: $
                                {(
                                  Number(item.unit_price) *
                                  Number(item.quantity)
                                ).toFixed(2)}
                              </p>
                            </div>

                            {item.configuration ? (
                              <ConfigurationList
                                configuration={item.configuration}
                              />
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="text-neutral-400">
                      No items were found for this order.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Customer Notes
                </h2>

                <p className="mt-4 whitespace-pre-wrap text-neutral-300">
                  {order.customer_notes || "No notes were provided."}
                </p>
              </section>
            </div>

            <aside className="space-y-6">
              <OrderStatusEditor
                orderId={order.id}
                initialPaymentStatus={order.payment_status}
                initialOrderStatus={order.order_status}
                initialShippingCarrier={order.shipping_carrier}
                initialTrackingNumber={order.tracking_number}
              />

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Customer
                </h2>

                <div className="mt-5 space-y-3 text-neutral-300">
                  <DetailRow
                    label="Name"
                    value={order.customer_name}
                  />

                  <DetailRow
                    label="Email"
                    value={order.customer_email}
                  />

                  <DetailRow
                    label="Phone"
                    value={order.customer_phone}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Shipping Address
                </h2>

                <div className="mt-5 text-neutral-300">
                  <p>{order.shipping_address_line_1}</p>

                  {order.shipping_address_line_2 ? (
                    <p>{order.shipping_address_line_2}</p>
                  ) : null}

                  <p>
                    {order.shipping_city}, {order.shipping_state}{" "}
                    {order.shipping_zip}
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Shipment
                </h2>

                <div className="mt-5 space-y-3 text-neutral-300">
                  <DetailRow
                    label="Carrier"
                    value={order.shipping_carrier || "Not assigned"}
                  />

                  <DetailRow
                    label="Tracking Number"
                    value={order.tracking_number || "Not assigned"}
                  />

                  <DetailRow
                    label="Shipped"
                    value={
                      order.shipped_at
                        ? new Date(order.shipped_at).toLocaleString()
                        : "Not shipped"
                    }
                  />
                </div>

                {order.tracking_number ? (
                  <a
                    href={getTrackingUrl(
                      order.shipping_carrier,
                      order.tracking_number
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold transition hover:border-neutral-500"
                  >
                    Track Package
                  </a>
                ) : null}
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Payment
                </h2>

                <div className="mt-5 space-y-3 text-neutral-300">
                  <DetailRow
                    label="Method"
                    value={formatValue(order.payment_method)}
                  />

                  <DetailRow
                    label="Username"
                    value={order.payment_username || "Not provided"}
                  />

                  <DetailRow
                    label="Status"
                    value={formatValue(order.payment_status)}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-2xl font-semibold">
                  Order Total
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>
                      ${Number(order.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Shipping</span>
                    <span>
                      ${Number(order.shipping_cost ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-neutral-800 pt-4 text-3xl font-bold">
                    <span>Total</span>
                    <span>
                      $
                      {Number(
                        order.total ?? order.price ?? 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function ConfigurationList({
  configuration,
}: {
  configuration: Record<string, unknown>;
}) {
  const entries = Object.entries(configuration);

  if (entries.length === 0) {
    return null;
  }

  return (
    <details className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900">
      <summary className="cursor-pointer px-4 py-3 font-medium">
        View configuration
      </summary>

      <div className="grid gap-3 border-t border-neutral-800 p-4 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl bg-neutral-950 px-3 py-3"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">
              {formatKey(key)}
            </p>

            <p className="mt-1 break-words text-sm text-white">
              {String(value ?? "")}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

function getTrackingUrl(
  carrier: string | null,
  trackingNumber: string
) {
  const encodedTrackingNumber =
    encodeURIComponent(trackingNumber.trim());

  switch (carrier) {
    case "UPS":
      return `https://www.ups.com/track?tracknum=${encodedTrackingNumber}`;

    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${encodedTrackingNumber}`;

    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodedTrackingNumber}`;

    case "DHL":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodedTrackingNumber}`;

    default:
      return `https://www.google.com/search?q=${encodedTrackingNumber}`;
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>

      <p className="mt-1 break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatusBadge({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {formatValue(value)}
      </p>
    </div>
  );
}

function formatKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}