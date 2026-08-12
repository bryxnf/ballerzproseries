// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { prebuiltGloves } from "../../../lib/glove-options";
// import PrebuiltAddToCartButton from "./PrebuiltAddToCartButton";
// import PrebuiltImageGallery from "./PrebuiltImageGallery";
// import SiteHeader from "../../components/SiteHeader";
// import { ArrowLeft } from "lucide-react";

// type PageProps = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// export default async function PrebuiltGloveDetailPage({ params }: PageProps) {
//   const { id } = await params;

//   const glove = prebuiltGloves.find((item) => item.id === id);

//   if (!glove) {
//     notFound();
//   }

//   return (
//     <main className="min-h-screen bg-neutral-950 text-white">
//       <div className="mx-auto max-w-7xl px-6 py-10">
//         <Link
//           href="/prebuilt"
//           className="inline-flex items-center gap-2 text-sm text-white transition hover:text-neutral-300"
//           aria-label="Back to Prebuilt Gloves"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Prebuilt Gloves
//         </Link>

//         <div className="mt-8 grid gap-10 lg:grid-cols-2">
//           <PrebuiltImageGallery
//             images={glove.images}
//             name={glove.name}
//           />

//           <div className="flex flex-col justify-between">
//             <div>
//               <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
//                 Ballerz Pro Series
//               </p>

//               <h1 className="mt-3 text-4xl font-bold">{glove.name}</h1>

//               <p className="mt-4 text-lg text-neutral-300">
//                 {glove.description}
//               </p>

//               <div className="mt-8 space-y-3 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
//                 <div className="flex justify-between">
//                   <span className="text-neutral-400">Model</span>
//                   <span>{glove.model}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-neutral-400">Sport</span>
//                   <span>{glove.sport}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-neutral-400">Color</span>
//                   <span>{glove.color}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-10 flex items-center justify-between">
//               <p className="text-4xl font-bold">${glove.price}</p>

//               <PrebuiltAddToCartButton glove={glove} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// } old code of hardcoded prebuilt glove detail page, now replaced with dynamic data from supabase and local gloves

import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import { createClient } from "../../../lib/supabase/server";
import { prebuiltGloves } from "../../../lib/glove-options";
import PrebuiltAddToCartButton from "./PrebuiltAddToCartButton";

type PrebuiltDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PrebuiltDetailPage({
  params,
}: PrebuiltDetailPageProps) {
  const { id } = await params;

  const localGlove = prebuiltGloves.find(
    (glove) => glove.id === id
  );

  let glove = localGlove
    ? {
        ...localGlove,
        price: Number(localGlove.price),
        stockQuantity: 1,
      }
    : null;

  if (!glove) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("prebuilt_gloves")
      .select(`
        slug,
        name,
        price,
        model,
        sport,
        color,
        description,
        image_url,
        stock_quantity
      `)
      .eq("slug", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      notFound();
    }

    glove = {
      id: data.slug,
      name: data.name,
      price: Number(data.price),
      model: data.model,
      sport: data.sport,
      color: data.color ?? "",
      image: data.image_url,
      images: [data.image_url],
      description: data.description ?? "",
      stockQuantity: data.stock_quantity,
    };
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-white">
              <img
                src={glove.image}
                alt={glove.name}
                className="h-full w-full object-contain"
              />
            </div>

            <section>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                Prebuilt Glove
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {glove.name}
              </h1>

              <p className="mt-4 text-3xl font-bold">
                ${glove.price.toFixed(2)}
              </p>

              <div className="mt-6 space-y-2 text-neutral-300">
                <p>
                  <span className="text-neutral-500">
                    Model:
                  </span>{" "}
                  {glove.model}
                </p>

                <p>
                  <span className="text-neutral-500">
                    Sport:
                  </span>{" "}
                  {glove.sport}
                </p>

                {glove.color ? (
                  <p>
                    <span className="text-neutral-500">
                      Colors:
                    </span>{" "}
                    {glove.color}
                  </p>
                ) : null}
              </div>

              {glove.description ? (
                <p className="mt-6 leading-7 text-neutral-400">
                  {glove.description}
                </p>
              ) : null}

              <div className="mt-8">
                <PrebuiltAddToCartButton glove={glove} />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}