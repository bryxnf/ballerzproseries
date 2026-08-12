"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatusEditorProps = {
  orderId: number;
  initialPaymentStatus: string;
  initialOrderStatus: string;
  initialShippingCarrier?: string | null;
  initialTrackingNumber?: string | null;
};

const paymentStatuses = [
  {
    value: "awaiting_verification",
    label: "Awaiting Verification",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "payment_issue",
    label: "Payment Issue",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
];

const orderStatuses = [
  {
    value: "awaiting_payment",
    label: "Awaiting Payment",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "in_production",
    label: "In Production",
  },
  {
    value: "ready_to_ship",
    label: "Ready to Ship",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const shippingCarriers = [
  "",
  "USPS",
  "UPS",
  "FedEx",
  "DHL",
  "Local Pickup",
  "Other",
];

export default function OrderStatusEditor({
  orderId,
  initialPaymentStatus,
  initialOrderStatus,
  initialShippingCarrier = "",
  initialTrackingNumber = "",
}: OrderStatusEditorProps) {
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState(
    initialPaymentStatus
  );

  const [orderStatus, setOrderStatus] = useState(
    initialOrderStatus
  );

  const [shippingCarrier, setShippingCarrier] = useState(
    initialShippingCarrier ?? ""
  );

  const [trackingNumber, setTrackingNumber] = useState(
    initialTrackingNumber ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function saveOrder() {
    try {
      setIsSaving(true);
      setMessage("");
      setErrorMessage("");

      if (
        orderStatus === "shipped" &&
        !shippingCarrier.trim()
      ) {
        throw new Error(
          "Select a shipping carrier before marking the order as shipped."
        );
      }

      if (
        orderStatus === "shipped" &&
        shippingCarrier !== "Local Pickup" &&
        !trackingNumber.trim()
      ) {
        throw new Error(
          "Enter a tracking number before marking the order as shipped."
        );
      }

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus,
            orderStatus,
            shippingCarrier,
            trackingNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The order could not be updated."
        );
      }

      setMessage("Order details updated.");
      router.refresh();
    } catch (error) {
      console.error("Order update error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The order could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">
        Manage Order
      </h2>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-neutral-300">
            Payment Status
          </span>

          <select
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value)
            }
            className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none"
          >
            {paymentStatuses.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-neutral-300">
            Order Status
          </span>

          <select
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(event.target.value)
            }
            className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none"
          >
            {orderStatuses.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <div className="border-t border-neutral-800 pt-5">
          <h3 className="text-lg font-semibold">
            Shipping Information
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">
                Carrier
              </span>

              <select
                value={shippingCarrier}
                onChange={(event) =>
                  setShippingCarrier(event.target.value)
                }
                className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="">
                  Select a carrier
                </option>

                {shippingCarriers
                  .filter(Boolean)
                  .map((carrier) => (
                    <option
                      key={carrier}
                      value={carrier}
                    >
                      {carrier}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-300">
                Tracking Number
              </span>

              <input
                type="text"
                value={trackingNumber}
                onChange={(event) =>
                  setTrackingNumber(event.target.value)
                }
                placeholder="Enter tracking number"
                className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none"
              />
            </label>
          </div>
        </div>

        {message ? (
          <p className="rounded-2xl border border-green-900 bg-green-950/40 p-4 text-sm text-green-300">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={saveOrder}
          disabled={isSaving}
          className="w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Order Details"}
        </button>
      </div>
    </section>
  );
}