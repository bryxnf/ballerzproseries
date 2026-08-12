"use client";

import { useState } from "react";
import { addCartItem } from "../../../lib/cart";

type PrebuiltAddToCartButtonProps = {
  glove: {
    id: string;
    name: string;
    price: number;
    image: string;
    images: string[];
    model: string;
    sport: string;
    color: string;
    description: string;
    stockQuantity: number;
  };
};

export default function PrebuiltAddToCartButton({
  glove,
}: PrebuiltAddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleAddToCart() {
    try {
      setIsAdding(true);
      setErrorMessage("");
      if (glove.stockQuantity <= 0) {
        setErrorMessage("This glove is sold out.");
        return;
      }

      addCartItem({
        id: `prebuilt-${glove.id}`,
        type: "prebuilt",
        name: glove.name,
        price: glove.price,
        quantity: 1,
        image: glove.image,
        configuration: {
          prebuiltSlug: glove.id,
          model: glove.model,
          sport: glove.sport,
          color: glove.color,
        },
      });

      window.location.href = "/cart";
    } catch (error) {
      console.error("Could not add prebuilt glove:", error);

      setErrorMessage(
        "The glove could not be added to your cart."
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || glove.stockQuantity <= 0}
        className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {glove.stockQuantity <= 0
          ? "Sold Out"
          : isAdding
            ? "Adding..."
            : "Add to Cart"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}