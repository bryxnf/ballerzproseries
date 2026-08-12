"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-md">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Ballerz Pro Series
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Owner Login
            </h1>

            <p className="mt-3 text-neutral-400">
              Sign in to view and manage customer orders.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-300">
                  Email
                </span>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-300">
                  Password
                </span>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500"
                />
              </label>

              {errorMessage ? (
                <p className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}