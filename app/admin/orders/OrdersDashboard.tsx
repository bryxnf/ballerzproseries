"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type AdminOrder = {
  id: number;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_username: string | null;
  payment_method: string | null;
  payment_status: string | null;
  order_status: string | null;
  subtotal: number | string | null;
  total: number | string | null;
  price: number | string | null;
  created_at: string;
};

type OrdersDashboardProps = {
  orders: AdminOrder[];
};

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In Production" },
  { value: "ready_to_ship", label: "Ready to Ship" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersDashboard({
  orders: initialOrders,
}: OrdersDashboardProps) {
  const router = useRouter();

  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(order: AdminOrder) {
    const confirmed = window.confirm(
      `Delete order ${order.order_number}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(order.id);
      setDeleteError("");

      const response = await fetch(
        `/api/admin/orders/${order.id}`,
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

      setOrders((currentOrders) =>
        currentOrders.filter((item) => item.id !== order.id)
      );

      router.refresh();
    } catch (error) {
      console.error("Order delete error:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "The order could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.order_status === statusFilter ||
        order.payment_status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.payment_username,
        order.payment_method,
        order.payment_status,
        order.order_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders
    .filter((order) => order.order_status !== "cancelled")
    .reduce(
      (total, order) =>
        total + getOrderTotal(order),
      0
    );

  const awaitingPaymentCount = orders.filter(
    (order) =>
      order.order_status === "awaiting_payment" ||
      order.payment_status === "awaiting_verification"
  ).length;

  const inProductionCount = orders.filter(
    (order) => order.order_status === "in_production"
  ).length;

  const readyToShipCount = orders.filter(
    (order) => order.order_status === "ready_to_ship"
  ).length;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(orders.length)}
          description="All submitted orders"
        />

        <StatCard
          label="Awaiting Payment"
          value={String(awaitingPaymentCount)}
          description="Needs payment verification"
        />

        <StatCard
          label="In Production"
          value={String(inProductionCount)}
          description="Currently being built"
        />

        <StatCard
          label="Revenue"
          value={formatMoney(totalRevenue)}
          description={`${readyToShipCount} ready to ship`}
        />
      </section>

      <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">
              Search orders
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order number, customer, email..."
              className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-neutral-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">
              Filter by status
            </span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}

              <option value="awaiting_verification">
                Payment: Awaiting Verification
              </option>

              <option value="paid">
                Payment: Paid
              </option>

              <option value="payment_issue">
                Payment: Payment Issue
              </option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-400">
          <p>
            Showing {filteredOrders.length} of {orders.length} orders
          </p>

          {search || statusFilter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-white transition hover:border-neutral-500"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {deleteError ? (
        <p className="mt-4 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {deleteError}
        </p>
      ) : null}

      <section className="mt-6">
        {filteredOrders.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-neutral-800 lg:block">
              <table className="w-full">
                <thead className="bg-neutral-900">
                  <tr>
                    <TableHeading>Order</TableHeading>
                    <TableHeading>Customer</TableHeading>
                    <TableHeading>Total</TableHeading>
                    <TableHeading>Payment</TableHeading>
                    <TableHeading>Status</TableHeading>
                    <TableHeading>
                      <span className="sr-only">Open</span>
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="bg-neutral-950">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-neutral-800 transition hover:bg-neutral-900/70"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDate(order.created_at)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p>
                          {order.customer_name || "Not provided"}
                        </p>

                        <p className="mt-1 text-sm text-neutral-500">
                          {order.customer_email || ""}
                        </p>
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {formatMoney(getOrderTotal(order))}
                      </td>

                      <td className="px-6 py-5">
                        <p>{formatValue(order.payment_method)}</p>

                        <div className="mt-2">
                          <StatusBadge
                            value={
                              order.payment_status ||
                              "awaiting_verification"
                            }
                            type="payment"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          value={
                            order.order_status ||
                            "awaiting_payment"
                          }
                          type="order"
                        />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex rounded-xl bg-white px-4 py-2 font-semibold text-black transition hover:opacity-90"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(order)}
                            disabled={deletingId === order.id}
                            className="inline-flex rounded-xl border border-red-800 bg-red-950/60 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === order.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <p className="text-xl font-bold">
                      {formatMoney(getOrderTotal(order))}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-neutral-500">
                      Customer
                    </p>

                    <p className="mt-1">
                      {order.customer_name || "Not provided"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      {order.customer_email || ""}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <StatusBadge
                      value={
                        order.payment_status ||
                        "awaiting_verification"
                      }
                      type="payment"
                    />

                    <StatusBadge
                      value={
                        order.order_status ||
                        "awaiting_payment"
                      }
                      type="order"
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex-1 rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black"
                    >
                      View Order
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(order)}
                      disabled={deletingId === order.id}
                      className="flex-1 rounded-2xl border border-red-800 bg-red-950/60 px-5 py-3 text-center font-semibold text-red-300 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === order.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No matching orders
            </h2>

            <p className="mt-3 text-neutral-400">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-sm text-neutral-400">{label}</p>

      <p className="mt-3 text-4xl font-bold">{value}</p>

      <p className="mt-3 text-sm text-neutral-500">
        {description}
      </p>
    </article>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
      {children}
    </th>
  );
}

function StatusBadge({
  value,
  type,
}: {
  value: string;
  type: "payment" | "order";
}) {
  const className = getStatusClass(value, type);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {formatValue(value)}
    </span>
  );
}

function getStatusClass(
  value: string,
  type: "payment" | "order"
) {
  if (
    value === "paid" ||
    value === "completed" ||
    value === "confirmed"
  ) {
    return "border-green-800 bg-green-950/60 text-green-300";
  }

  if (
    value === "awaiting_payment" ||
    value === "awaiting_verification"
  ) {
    return "border-yellow-800 bg-yellow-950/60 text-yellow-300";
  }

  if (
    value === "in_production" ||
    value === "ready_to_ship"
  ) {
    return "border-blue-800 bg-blue-950/60 text-blue-300";
  }

  if (value === "shipped") {
    return "border-purple-800 bg-purple-950/60 text-purple-300";
  }

  if (
    value === "cancelled" ||
    value === "payment_issue" ||
    value === "refunded"
  ) {
    return "border-red-800 bg-red-950/60 text-red-300";
  }

  return type === "payment"
    ? "border-neutral-700 bg-neutral-800 text-neutral-300"
    : "border-neutral-700 bg-neutral-800 text-neutral-300";
}

function getOrderTotal(order: AdminOrder) {
  const value =
    order.total ??
    order.price ??
    order.subtotal ??
    0;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatValue(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  if (value === "cashapp") {
    return "Cash App";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}