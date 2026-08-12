import { redirect } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import { createClient } from "../../../lib/supabase/server";
import PrebuiltManager from "./PrebuiltManager";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export default async function AdminPrebuiltPage() {
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

  const { data: gloves, error } = await supabaseAdmin
    .from("prebuilt_gloves")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load prebuilt gloves:", error);
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Prebuilt Gloves
          </h1>

          <p className="mt-3 text-neutral-400">
            Add and manage gloves available in the prebuilt catalog.
          </p>

          <div className="mt-8">
            <PrebuiltManager gloves={gloves ?? []} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
            <a
                href="/admin/orders"
                className="rounded-2xl border border-neutral-700 px-5 py-3 font-semibold text-white"
            >
                Orders
            </a>

            <a
                href="/admin/prebuilt"
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black"
            >
                Manage Prebuilt Gloves
            </a>
        </div>
      </main>
    </>
  );
}