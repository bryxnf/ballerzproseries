"use client";

import Image from "next/image";
import { colorMap, gloveLayerAssets } from "../../lib/glove-options";

type Props = {
  model: string;
  palmColor: string;
  weltingColor: string;
  bindingColor: string;
  laceColor: string;
  logoColor: string;
  webColor: string;
};

function resolveModelKey(model: string) {
  if (model.toLowerCase().includes("fielder")) return "fielder";
  return "fielder";
}

export default function LayeredGlovePreview({
  model,
  palmColor,
  weltingColor,
  bindingColor,
  laceColor,
  logoColor,
  webColor,
}: Props) {
  const modelKey = resolveModelKey(model) as keyof typeof gloveLayerAssets;
  const assets = gloveLayerAssets[modelKey];

  if (!assets) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-neutral-700 bg-neutral-950">
        <p className="text-sm text-neutral-400">
          No preview layers available for this model yet.
        </p>
      </div>
    );
  }

  return (
  <div className="relative h-full w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/30 to-black/40" />

    <div className="absolute inset-0 p-6">
      <div className="relative h-full w-full">
        <Image
          src={assets.base}
          alt={`${model} base`}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-contain"
        />

        <OptionalTintLayer src={assets.palm} color={palmColor} />
        <OptionalTintLayer src={assets.welting} color={weltingColor} />
        <OptionalTintLayer src={assets.binding} color={bindingColor} />
        <OptionalTintLayer src={assets.web} color={webColor} />
        <OptionalTintLayer src={assets.lace} color={laceColor} />
      </div>
    </div>
  </div>
);
}

function lightenColor(hex: string, amount = 0.25) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + 255 * amount;
  let g = ((num >> 8) & 0x00ff) + 255 * amount;
  let b = (num & 0x0000ff) + 255 * amount;

  r = Math.min(255, Math.floor(r));
  g = Math.min(255, Math.floor(g));
  b = Math.min(255, Math.floor(b));

  return `rgb(${r}, ${g}, ${b})`;
}

function OptionalTintLayer({
  src,
  color,
  opacity = 0.6,
  blendMode,
}: {
  src?: string;
  color: string;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}) {
  if (!src) return null;

  const baseColor = colorMap[color] ?? "#ffffff";

  const isWhite =
    color === "White" ||
    baseColor.toLowerCase() === "#ffffff" ||
    baseColor.toLowerCase() === "#f5f5f5";

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: isWhite
          ? "#fafafa"
          : lightenColor(baseColor, 0.25),

        opacity: isWhite ? 0.60 : opacity,

        mixBlendMode: isWhite
          ? "normal"
          : blendMode || "multiply",

        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}