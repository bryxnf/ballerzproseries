"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import {
  CartItem,
  clearCart,
  getCart,
} from "../../lib/cart";

type PaymentMethod = "cashapp" | "venmo";

type CompletedOrder = {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cashapp");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [paymentUsername, setPaymentUsername] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedOrder, setCompletedOrder] =
    useState<CompletedOrder | null>(null);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [items]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (items.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,

          addressLine1,
          addressLine2,
          city,
          state,
          zip,

          paymentMethod,
          paymentUsername,
          customerNotes,

          items,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The order could not be submitted."
        );
      }

      setCompletedOrder({
        orderNumber: result.orderNumber,
        subtotal: result.subtotal,
        shippingCost: result.shippingCost,
        total: result.total,
      });

      clearCart();
    } catch (error) {
      console.error("Checkout submission error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The order could not be submitted."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completedOrder) {
    const qrImage =
      paymentMethod === "cashapp"
        ? "/payments/cashapp-qr.png"
        : "/payments/venmo-qr.png";

    const paymentName =
      paymentMethod === "cashapp" ? "Cash App" : "Venmo";

    return (
      <>
        <SiteHeader />

        <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-3xl">
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Order created
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Complete Your Payment
              </h1>

              <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white p-5">
                <Image
                  src={qrImage}
                  alt={`${paymentName} payment QR code`}
                  width={500}
                  height={500}
                  className="h-auto w-full"
                />
              </div>

              <p className="mt-6 text-neutral-300">
                Send exactly:
              </p>

              <p className="mt-2 text-5xl font-bold">
                ${completedOrder.total.toFixed(2)}
              </p>

              <div className="mt-8 rounded-2xl border border-yellow-700/50 bg-yellow-950/30 p-5">
                <p className="text-sm text-yellow-200">
                  Include this order number in the payment note:
                </p>

                <p className="mt-2 text-3xl font-bold tracking-wider text-yellow-300">
                  {completedOrder.orderNumber}
                </p>
              </div>

              <p className="mt-6 text-sm leading-6 text-neutral-400">
                Your order will remain awaiting payment until the owner
                verifies the Cash App or Venmo transaction.
              </p>

              <Link
                href="/"
                className="mt-8 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black"
              >
                Return Home
              </Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <SiteHeader />

        <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-4xl">
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
              <h1 className="text-4xl font-bold">
                Your cart is empty
              </h1>

              <p className="mt-4 text-neutral-400">
                Add a custom or prebuilt glove before checking out.
              </p>

              <Link
                href="/cart"
                className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black"
              >
                Return to Cart
              </Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Ballerz Pro Series
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Checkout
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]"
          >
            <div className="space-y-6">
              <CheckoutSection title="Contact Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CheckoutField
                    label="Full Name"
                    value={customerName}
                    onChange={setCustomerName}
                    required
                  />

                  <CheckoutField
                    label="Email"
                    type="email"
                    value={customerEmail}
                    onChange={setCustomerEmail}
                    required
                  />

                  <CheckoutField
                    label="Phone"
                    type="tel"
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    required
                  />
                </div>
              </CheckoutSection>

              <CheckoutSection title="Shipping Address">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <CheckoutField
                      label="Address"
                      value={addressLine1}
                      onChange={setAddressLine1}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <CheckoutField
                      label="Apartment, Suite, etc. (optional)"
                      value={addressLine2}
                      onChange={setAddressLine2}
                    />
                  </div>

                  <CheckoutField
                    label="City"
                    value={city}
                    onChange={setCity}
                    required
                  />

                  <CheckoutField
                    label="State"
                    value={state}
                    onChange={setState}
                    required
                  />

                  <CheckoutField
                    label="ZIP Code"
                    value={zip}
                    onChange={setZip}
                    required
                  />
                </div>
              </CheckoutSection>

              <CheckoutSection title="Payment Method">
                <div className="grid gap-4 sm:grid-cols-2">
                  <PaymentOption
                    name="paymentMethod"
                    label="Cash App"
                    checked={paymentMethod === "cashapp"}
                    onChange={() => setPaymentMethod("cashapp")}
                  />

                  <PaymentOption
                    name="paymentMethod"
                    label="Venmo"
                    checked={paymentMethod === "venmo"}
                    onChange={() => setPaymentMethod("venmo")}
                  />
                </div>

                <div className="mt-5">
                  <CheckoutField
                    label={
                      paymentMethod === "cashapp"
                        ? "Your Cash App name or $Cashtag"
                        : "Your Venmo username"
                    }
                    value={paymentUsername}
                    onChange={setPaymentUsername}
                    placeholder={
                      paymentMethod === "cashapp"
                        ? "$username"
                        : "@username"
                    }
                  />
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-400">
                  After creating the order, you will receive an order
                  number and the selected payment QR code.
                </p>
              </CheckoutSection>

              <CheckoutSection title="Order Notes">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-300">
                    Additional notes (optional)
                  </span>

                  <textarea
                    value={customerNotes}
                    onChange={(event) =>
                      setCustomerNotes(event.target.value)
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500"
                    placeholder="Anything the owner should know about your order?"
                  />
                </label>
              </CheckoutSection>
            </div>

            <aside className="h-fit rounded-3xl border border-neutral-800 bg-neutral-900 p-6 lg:sticky lg:top-8">
              <h2 className="text-2xl font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-neutral-800 pb-5"
                  >
                    {item.image ? (
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-neutral-400">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-neutral-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>

                <div className="flex justify-between border-t border-neutral-800 pt-4 text-2xl font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {errorMessage ? (
                <p className="mt-5 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating Order..."
                  : "Create Order & View Payment"}
              </button>

              <Link
                href="/cart"
                className="mt-3 block text-center text-sm text-neutral-400 hover:text-white"
              >
                Return to cart
              </Link>
            </aside>
          </form>
        </div>
      </main>
    </>
  );
}

function CheckoutSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-300">
        {label}
      </span>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500"
      />
    </label>
  );
}

function PaymentOption({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-5 transition ${
        checked
          ? "border-white bg-white text-black"
          : "border-neutral-700 bg-black text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
        />

        <span className="font-semibold">{label}</span>
      </div>
    </label>
  );
}