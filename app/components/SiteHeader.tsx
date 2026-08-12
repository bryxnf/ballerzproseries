"use client";

import { useEffect, useState } from "react";
import { getCartItemCount } from "../../lib/cart";
import Image from "next/image";
import Link from "next/link";
import { Backpack } from "lucide-react";

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
      function updateCartCount() {
        setCartCount(getCartItemCount());
      }

      updateCartCount();

      window.addEventListener(
        "ballerz-cart-updated",
        updateCartCount
      );

      window.addEventListener(
        "storage",
        updateCartCount
      );

      return () => {
        window.removeEventListener(
          "ballerz-cart-updated",
          updateCartCount
        );

        window.removeEventListener(
          "storage",
          updateCartCount
        );
      };
    }, []);
  

  return (
    <header className="border-b border-neutral-600 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/logoBPS1.png"
            alt="Ballerz Pro Series"
            width={260}
            height={70}
            priority
            className="h-auto w-[190px] sm:w-[230px] lg:w-[260px]"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/order-status"
            className="text-sm font-medium text-neutral-300 transition hover:text-white"
          >
            Track Order
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center"
            aria-label={`Cart with ${cartCount} items`}
          >
            <Backpack className="h-5 w-5" />

            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-black">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

      </div>
    </header>
  );
}