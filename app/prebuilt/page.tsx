// import Link from "next/link";
// import Image from "next/image";
// import { prebuiltGloves } from "../../lib/glove-options";
// import SiteHeader from "../components/SiteHeader";

// export default function PrebuiltPage() {
//   return (
//     <main className="min-h-screen bg-neutral-950 text-white">
//       <SiteHeader />
//       <div className="mx-auto max-w-7xl px-6 py-10">
//         <div className="mb-10">
//           <h1 className="mt-2 text-4xl font-bold">Prebuilt Gloves</h1>
//           <p className="mt-3 max-w-2xl text-neutral-300">
//             Browse prebuilt gloves that are ready to shop without going through
//             the full custom builder.
//           </p>
//         </div>

//         <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
//           {prebuiltGloves.map((glove) => (
//             <div
//               key={glove.id}
//               className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
//             >
//               <div className="relative aspect-[4/3] w-full bg-neutral-950">
//                 <Image
//                   src={glove.image}
//                   alt={glove.name}
//                   fill
//                   className="object-contain p-3"
//                 />
//               </div>

//               <div className="flex min-h-[240px] flex-col p-6">
//                 <h2 className="text-2xl font-semibold">{glove.name}</h2>
//                 <p className="mt-3 line-clamp-3 text-sm text-neutral-300">
//                   {glove.description}
//                 </p>

//                 <div className="mt-4 space-y-2 text-sm text-neutral-400">
//                   <p>Model: {glove.model}</p>
//                   <p>Sport: {glove.sport}</p>
//                   <p>Color: {glove.color}</p>
//                 </div>

//                 <div className="mt-auto flex items-center justify-between pt-6">
//                   <p className="text-3xl font-bold">${glove.price}</p>
//                   <Link
//                     href={`/prebuilt/${glove.id}`}
//                     className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
//                   >
//                     View Glove
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </main>
//   );
// } hardcoded prebuilt gloves are now being pulled from the database instead of this static list. This file is no longer used and can be deleted.

import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { createClient } from "../../lib/supabase/server";
import { prebuiltGloves as localGloves } from "../../lib/glove-options";

export default async function PrebuiltPage() {
  const supabase = await createClient();

  const { data: databaseGloves, error } = await supabase
    .from("prebuilt_gloves")
    .select(`
      id,
      slug,
      name,
      price,
      model,
      sport,
      color,
      description,
      image_url,
      is_active,
      stock_quantity
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load Supabase prebuilt gloves:", error);
  }

  const supabaseGloves =
    databaseGloves?.map((glove) => ({
      id: glove.slug,
      name: glove.name,
      price: Number(glove.price),
      model: glove.model,
      sport: glove.sport,
      color: glove.color ?? "",
      stockQuantity: glove.stock_quantity,
      image: glove.image_url,
      images: [glove.image_url],
      description: glove.description ?? "",
      source: "database" as const,
    })) ?? [];

  const hardcodedGloves = localGloves.map((glove) => ({
    ...glove,
    stockQuantity: 1,
    source: "local" as const,
  }));

  const gloves = [...supabaseGloves, ...hardcodedGloves];

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Ballerz Pro Series
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Prebuilt Gloves
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-400">
            Shop ready-made Ballerz gloves or build your own custom glove.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gloves.map((glove) => (
              <Link
                key={`${glove.source}-${glove.id}`}
                href={`/prebuilt/${glove.id}`}
                className="group overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600"
              >
                <div className="aspect-square overflow-hidden bg-white">
                  <img
                    src={glove.image}
                    alt={glove.name}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold">
                      {glove.name}
                    </h2>

                    <p className="font-bold">
                      ${glove.price.toFixed(2)}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-neutral-400">
                    {glove.model}
                  </p>

                  {glove.color ? (
                    <p className="mt-1 text-sm text-neutral-500">
                      {glove.color}
                    </p>
                  ) : null}

                  {glove.stockQuantity > 0 ? (
                    <p className="mt-3 text-sm font-medium text-green-400">
                      {glove.stockQuantity === 1
                        ? "Only 1 left"
                        : `${glove.stockQuantity} in stock`}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-red-400">
                      Sold Out
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}


