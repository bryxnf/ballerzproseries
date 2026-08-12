"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import {
  CartItem,
  getCart,
  removeCartItem,
  updateCartQuantity,
} from "../../lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  function refreshCart() {
    setItems(getCart());
  }

  useEffect(() => {
    refreshCart();

    function handleCartUpdate() {
      refreshCart();
    }

    window.addEventListener(
      "ballerz-cart-updated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "ballerz-cart-updated",
        handleCartUpdate
      );
    };
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [items]);

  function handleQuantityChange(
    itemId: string,
    quantity: number
  ) {
    if (!Number.isFinite(quantity)) {
      return;
    }

    updateCartQuantity(itemId, quantity);
    refreshCart();
  }

  function handleRemove(itemId: string) {
    removeCartItem(itemId);
    refreshCart();
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Ballerz Pro Series
          </p>

          <h1 className="mt-2 text-4xl font-bold">Your Cart</h1>

          {items.length === 0 ? (
            <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
              <h2 className="text-2xl font-semibold">
                Your cart is empty
              </h2>

              <p className="mt-3 text-neutral-400">
                Add a custom glove or a prebuilt glove to get started.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/build"
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-black"
                >
                  Build a Glove
                </a>

                <a
                  href="/prebuilt"
                  className="rounded-2xl border border-neutral-700 px-6 py-3 font-semibold text-white"
                >
                  View Prebuilt Gloves
                </a>
              </div>
            </section>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
              <section className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-5">
                        {item.image ? (
                          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 text-center text-xs text-neutral-500">
                            Custom
                            <br />
                            Glove
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            {item.type === "custom"
                              ? "Custom Glove"
                              : "Prebuilt Glove"}
                          </p>

                          <h2 className="mt-2 truncate text-xl font-semibold">
                            {item.name}
                          </h2>

                          <p className="mt-2 text-neutral-400">
                            ${item.price.toFixed(2)} each
                          </p>

                          {item.type === "custom" &&
                          item.configuration ? (
                            <div className="mt-3 text-sm text-neutral-500">
                              <p>
                                Model:{" "}
                                {String(
                                  item.configuration.model ?? ""
                                )}
                              </p>

                              <p>
                                Size:{" "}
                                {String(
                                  item.configuration.size ?? ""
                                )}
                              </p>

                              <p>
                                Throwing hand:{" "}
                                {String(
                                  item.configuration.throwingHand ??
                                    ""
                                )}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                        <p className="text-2xl font-bold">
                          $
                          {(
                            item.price * item.quantity
                          ).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2">
                            <span className="text-sm text-neutral-400">
                              Qty
                            </span>

                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(event.target.value)
                                )
                              }
                              className="w-20 rounded-xl border border-neutral-700 bg-black px-3 py-2 text-white outline-none"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(item.id)
                            }
                            className="rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="h-fit rounded-3xl border border-neutral-800 bg-neutral-900 p-6 lg:sticky lg:top-10">
                <h2 className="text-2xl font-semibold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-3 border-b border-neutral-800 pb-6">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Items</span>
                    <span>
                      {items.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Shipping</span>
                    <span>Calculated later</span>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <span className="text-neutral-400">
                    Subtotal
                  </span>

                  <span className="text-4xl font-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    router.push("/checkout");
                  }}
                  className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:opacity-90"
                >
                  Continue to Checkout
                </button>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a
                    href="/build"
                    className="rounded-2xl border border-neutral-700 px-4 py-3 text-center text-sm font-semibold"
                  >
                    Add Custom
                  </a>

                  <a
                    href="/prebuilt"
                    className="rounded-2xl border border-neutral-700 px-4 py-3 text-center text-sm font-semibold"
                  >
                    Add Prebuilt
                  </a>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}