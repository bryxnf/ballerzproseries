"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteOrderButtonProps = {
  orderId: number;
  orderNumber: string;
};

export default function DeleteOrderButton({
  orderId,
  orderNumber,
}: DeleteOrderButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete order ${orderNumber}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The order could not be deleted."
        );
      }

      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error("Order delete error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The order could not be deleted."
      );

      setIsDeleting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-red-900 bg-red-950/20 p-6">
      <h2 className="text-2xl font-semibold text-red-300">
        Danger Zone
      </h2>

      <p className="mt-3 text-sm text-neutral-400">
        Permanently delete this order and its items. This cannot
        be undone.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-5 w-full rounded-2xl border border-red-800 bg-red-950/60 px-6 py-4 font-semibold text-red-300 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete Order"}
      </button>
    </section>
  );
}
