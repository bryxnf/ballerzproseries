"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import SiteHeader from "./components/SiteHeader";
import { prebuiltGloves } from "../lib/glove-options";

export default function HomePage() {
  const featuredGloves = prebuiltGloves.filter((glove) =>
    ["spider-man", "la-dodgers-player", "pink-ice-cream"].includes(glove.id)
  );

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 text-white">
        <section className="mx-auto max-w-7xl px-6 pt-3 pb-10">
          <div className="relative h-[500px] overflow-hidden rounded-3xl border border-neutral-800">
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.12 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src="/images/hero/HomePageGlove1.png"
                alt="Ballerz Pro Series Glove"
                fill
                className="object-cover scale-90"
                priority
              />
            </motion.div>

            <div className="absolute inset-0 bg-black/50" />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col justify-end p-8"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                Ballerz Pro Series
              </p>

              <h1 className="mt-2 text-4xl font-bold text-white">
                Built Different.
              </h1>

              <p className="mt-3 max-w-lg text-white/80">
                Gloves that stand out. Designed for players who do not follow the standard.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/prebuilt"
              className="group rounded-3xl border border-neutral-800 bg-neutral-900 p-8 transition hover:border-neutral-600 hover:bg-neutral-800"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Option 1
              </p>

              <h2 className="mt-4 text-3xl font-bold">Prebuilt Gloves</h2>

              <p className="mt-4 text-neutral-300">
                Ready-to-go designs built to stand out immediately.
              </p>
            </Link>

            <Link
              href="/build"
              className="group rounded-3xl border border-neutral-800 bg-neutral-900 p-8 transition hover:border-neutral-600 hover:bg-neutral-800"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Option 2
              </p>

              <h2 className="mt-4 text-3xl font-bold">Custom Build</h2>

              <p className="mt-4 text-neutral-300">
                Create your own glove from the ground up — your colors, your style.
              </p>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Craftsmanship
            </p>

            <h2 className="mt-4 text-4xl font-bold">Hecho en Mexico</h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">
              Every glove is built by hand with attention to detail and identity. Our vision is rooted in premium handcrafted gloves that break the mold for players who want to express themselves on the field, not blend in. This is more than equipment, it’s expression on the field.
            </p>

            <div className="mt-8 max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
              <p className="text-lg italic text-white">
                “Hand made. No shortcuts. Every piece built with purpose.”
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Featured
              </p>
              <h2 className="mt-2 text-3xl font-bold">Top Designs</h2>
            </div>

            <Link
              href="/prebuilt"
              className="rounded-2xl border border-neutral-700 px-4 py-2 text-sm text-white transition hover:border-neutral-500"
            >
              View All
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredGloves.map((glove) => (
              <div
                key={glove.id}
                className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
              >
                <div className="relative aspect-[4/3] w-full bg-neutral-950">
                  <Image
                    src={glove.image}
                    alt={glove.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex min-h-[220px] flex-col p-6">
                  <h3 className="text-2xl font-semibold">{glove.name}</h3>

                  <p className="mt-3 line-clamp-3 text-sm text-neutral-300">
                    {glove.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6">
                    <p className="text-3xl font-bold">${glove.price}</p>

                    <Link
                      href={`/prebuilt/${glove.id}`}
                      className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}