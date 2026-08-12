import { redirect } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import { createClient } from "../../../lib/supabase/server";
import OrdersDashboard, {
  AdminOrder,
} from "./OrdersDashboard";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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

  const { data: orders, error: ordersError } =
    await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        payment_username,
        payment_method,
        payment_status,
        order_status,
        subtotal,
        total,
        price,
        created_at
      `)
      .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Could not load orders:", ordersError);
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Orders
            </h1>

            <p className="mt-3 text-neutral-400">
              Manage payments, production, and customer orders.
            </p>


            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/admin/orders"
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black"
              >
                Orders
              </a>

              <a
                href="/admin/prebuilt"
                className="rounded-2xl border border-neutral-700 px-5 py-3 font-semibold text-white transition hover:border-neutral-500"
              >
                Manage Prebuilt Gloves
              </a>
            </div>
          </div>

          {ordersError ? (
            <div className="rounded-3xl border border-red-900 bg-red-950/40 p-6 text-red-300">
              Orders could not be loaded. Check the server
              terminal for more information.
            </div>
          ) : (
            <OrdersDashboard
              orders={(orders ?? []) as AdminOrder[]}
            />
          )}
        </div>
      </main>
    </>
  );
}