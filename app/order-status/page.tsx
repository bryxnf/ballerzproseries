"use client";

import { FormEvent, useState } from "react";
import SiteHeader from "../components/SiteHeader";

type OrderStatusResult = {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  createdAt: string;
};

export default function OrderStatusPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] =
    useState<OrderStatusResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");
      setOrder(null);

      const response = await fetch(
        `/api/order-status?orderNumber=${encodeURIComponent(
          orderNumber.trim()
        )}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Order could not be found."
        );
      }

      setOrder(result.order);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Order could not be found."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Ballerz Pro Series
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Track Your Order
          </h1>

          <p className="mt-4 text-neutral-400">
            Enter your Ballerz order number to check its current
            status.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">
                Order Number
              </span>

              <input
                required
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(event.target.value)
                }
                placeholder="BPS-12345678-1234"
                className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-60"
            >
              {isLoading
                ? "Checking..."
                : "Check Order Status"}
            </button>

            {errorMessage ? (
              <p className="mt-4 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {errorMessage}
              </p>
            ) : null}
          </form>

          {order ? (
            <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    Order
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {order.orderNumber}
                  </h2>
                </div>

                <StatusBadge
                  value={order.orderStatus}
                />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <StatusBox
                  label="Payment Status"
                  value={formatValue(
                    order.paymentStatus
                  )}
                />

                <StatusBox
                  label="Order Status"
                  value={formatValue(
                    order.orderStatus
                  )}
                />

                <StatusBox
                  label="Carrier"
                  value={
                    order.shippingCarrier ||
                    "Not shipped yet"
                  }
                />

                <StatusBox
                  label="Tracking Number"
                  value={
                    order.trackingNumber ||
                    "Not available yet"
                  }
                />
              </div>

              <OrderProgress
                orderStatus={order.orderStatus}
                paymentStatus={order.paymentStatus}
              />

              {order.trackingNumber ? (
                <a
                  href={getTrackingUrl(
                    order.shippingCarrier,
                    order.trackingNumber
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-black"
                >
                  Track Package
                </a>
              ) : null}
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

function OrderProgress({
  paymentStatus,
  orderStatus,
}: {
  paymentStatus: string;
  orderStatus: string;
}) {
  const steps = [
    {
      label: "Order Received",
      complete: true,
    },
    {
      label: "Payment Verified",
      complete: paymentStatus === "paid",
    },
    {
      label: "Confirmed",
      complete: [
        "confirmed",
        "in_production",
        "ready_to_ship",
        "shipped",
        "completed",
      ].includes(orderStatus),
    },
    {
      label: "In Production",
      complete: [
        "in_production",
        "ready_to_ship",
        "shipped",
        "completed",
      ].includes(orderStatus),
    },
    {
      label: "Shipped",
      complete: [
        "shipped",
        "completed",
      ].includes(orderStatus),
    },
  ];

  return (
    <div className="mt-8 border-t border-neutral-800 pt-6">
      <h3 className="text-lg font-semibold">
        Order Progress
      </h3>

      <div className="mt-5 space-y-4">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-3"
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${
                step.complete
                  ? "border-green-700 bg-green-950 text-green-300"
                  : "border-neutral-700 bg-neutral-950 text-neutral-600"
              }`}
            >
              {step.complete ? "✓" : "•"}
            </div>

            <span
              className={
                step.complete
                  ? "text-white"
                  : "text-neutral-500"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex w-fit rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold">
      {formatValue(value)}
    </span>
  );
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getTrackingUrl(
  carrier: string | null,
  trackingNumber: string
) {
  const tracking =
    encodeURIComponent(trackingNumber);

  switch (carrier) {
    case "UPS":
      return `https://www.ups.com/track?tracknum=${tracking}`;

    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;

    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`;

    case "DHL":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${tracking}`;

    default:
      return `https://www.google.com/search?q=${tracking}`;
  }
}