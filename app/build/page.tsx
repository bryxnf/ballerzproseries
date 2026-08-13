"use client";

import Glove3DPreview from "./Glove3DPreview";
import { useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { addCartItem } from "../../lib/cart";
import {
  seriesOptions,
  modelOptions,
  sportOptions,
  throwingHandOptions,
  webStyleOptionsByModel,
  laceColorOptions,
  logoColorOptions,
  embroideryColorOptions,
  panelColorOptions,
  colorMap,
} from "../../lib/glove-options";

const sizeOptionsByModel: Record<string, string[]> = {
  Fielder: ["10.25", "11.0", "11.25", "11.5", "11.75", "12.0", "12.25", "12.5", "12.75", "13.0", "13.25", "13.5", "13.75", "14.0"],
  "1B Open Back": ["12.5", "12.75", "13.0", "13.25", "13.5", "13.75", "14.0"],
  "1B Closed Back": ["12.5", "12.75", "13.0", "13.25", "13.5", "13.75", "14.0"],
  "Baseball Catcher": ["32.5", "33.0", "33.5"],
  "Softball Catcher": ["33.0", "34.0"],
};

function captureGloveThumbnail(): string | undefined {
  const sourceCanvas = document.querySelector(
    "#glove-preview canvas"
  ) as HTMLCanvasElement | null;

  if (!sourceCanvas) {
    console.error("Glove preview canvas was not found.");
    return undefined;
  }

  const thumbnail = document.createElement("canvas");

  const targetWidth = 420;
  const scale = Math.min(1, targetWidth / sourceCanvas.width);

  thumbnail.width = Math.round(sourceCanvas.width * scale);
  thumbnail.height = Math.round(sourceCanvas.height * scale);

  const context = thumbnail.getContext("2d");

  if (!context) {
    return undefined;
  }

  // Gives transparent areas the same dark background as the preview.
  context.fillStyle = "#171717";
  context.fillRect(
    0,
    0,
    thumbnail.width,
    thumbnail.height
  );

  context.drawImage(
    sourceCanvas,
    0,
    0,
    thumbnail.width,
    thumbnail.height
  );

  // PNG preserves the rendered WebGL image more reliably.
  return thumbnail.toDataURL("image/png");
}

export default function BuildPage() {
  const [series, setSeries] = useState("Ballerz Full Custom");
  const [model, setModel] = useState("Fielder");
  const [sport, setSport] = useState("Baseball");
  const [throwingHand, setThrowingHand] = useState("Right-Hand Throw");
  const [size, setSize] = useState("11.5");

  const [webStyle, setWebStyle] = useState("I-Web");
  const [embroideryText, setEmbroideryText] = useState("");
  const [embroideryColor, setEmbroideryColor] = useState("White");

  const [outerPalmColor, setOuterPalmColor] = useState("White");
  const [outerThumbColor, setOuterThumbColor] = useState("White");
  const [outerIndexColor, setOuterIndexColor] = useState("White");
  const [outerMiddleColor, setOuterMiddleColor] = useState("White");
  const [outerRingColor, setOuterRingColor] = useState("White");
  const [outerPinkyColor, setOuterPinkyColor] = useState("White");
  const [wristColor, setWristColor] = useState("White");

  const [palmColor, setPalmColor] = useState("White"); 
  const [innerThumbColor, setInnerThumbColor] = useState("White");
  const [innerIndexColor, setInnerIndexColor] = useState("White");
  const [innerMiddleColor, setInnerMiddleColor] = useState("White");
  const [innerRingColor, setInnerRingColor] = useState("White");
  const [innerPinkyColor, setInnerPinkyColor] = useState("White");

  const [laceColor, setLaceColor] = useState("White");
  const [webColor, setWebColor] = useState("White");
  const [bindingColor, setBindingColor] = useState("White");
  const [weltingColor, setWeltingColor] = useState("White");

  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [patchColor, setPatchColor] = useState("White");
  const [palmLogoColor, setPalmLogoColor] = useState("White");
  const [logoColor, setLogoColor] = useState("White");

  const selectedSeries = useMemo(
    () => seriesOptions.find((option) => option.name === series),
    [series]
  );

  const availableSizes = useMemo(() => {
    return sizeOptionsByModel[model] ?? ["11.5"];
  }, [model]);

  const price = selectedSeries?.price ?? 189;
  const canAddEmbroidery = price === 229;

  async function handleAddToCart() {
    try {
      setIsAdding(true);
      setErrorMessage("");

      const gloveConfiguration = {
        series,
        sport,
        model,
        throwingHand,
        size,
        webStyle,

        outerPalmColor,
        outerThumbColor,
        outerIndexColor,
        outerMiddleColor,
        outerRingColor,
        outerPinkyColor,
        wristColor,

        palmColor,
        innerThumbColor,
        innerIndexColor,
        innerMiddleColor,
        innerRingColor,
        innerPinkyColor,

        laceColor,
        webColor,
        bindingColor,
        weltingColor,

        patchColor,
        palmLogoColor,
        logoColor,

        embroideryText: canAddEmbroidery
          ? embroideryText || "None"
          : "Not Available",

        embroideryColor: canAddEmbroidery
          ? embroideryColor
          : "Not Available",
      };

       await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      const previewImage = captureGloveThumbnail();

      addCartItem({
        id: `custom-${crypto.randomUUID()}`,
        type: "custom",
        name: `${series} - ${model}`,
        price,
        quantity: 1,
        image: previewImage,
        configuration: gloveConfiguration,
      });

      window.location.href = "/cart";
    } catch (error) {
      console.error("Add to cart error:", error);

      setErrorMessage(
        "Your custom glove could not be added to the cart."
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Ballerz Pro Series
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Custom Build
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-300">
              Build your glove step by step and create something that stands out.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:rounded-3xl sm:p-6">
              <h2 className="mb-6 text-2xl font-semibold">Builder</h2>

              <div className="space-y-4">
                <BuilderGroup title="Step 1 — Base" defaultOpen>
                  <Field label="Series">
                    <select
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                    >
                      {seriesOptions.map((option) => (
                        <option key={option.name} value={option.name}>
                          {option.name} - ${option.price}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Sport">
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                    >
                      {sportOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </BuilderGroup>

                <BuilderGroup title="Step 2 — Model & Fit">
                  <Field label="Model">
                    <select
                      value={model}
                      onChange={(e) => {
                        const nextModel = e.target.value;
                        setModel(nextModel);

                        const nextSizes = sizeOptionsByModel[nextModel] ?? ["11.5"];
                        setSize(nextSizes[0]);

                        const nextWebStyles = webStyleOptionsByModel[nextModel] ?? ["I-Web"];
                        setWebStyle(nextWebStyles[0]);
                      }}
                      className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                    >
                      {modelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Throwing Hand">
                    <select
                      value={throwingHand}
                      onChange={(e) => setThrowingHand(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                    >
                      {throwingHandOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Size">
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                    >
                      {availableSizes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </BuilderGroup>

                <BuilderGroup title="Step 3 — Colors">
                  <Field label="Web Style">
                    <div className="rounded-2xl border border-white bg-white px-4 py-3 font-medium text-black">
                      {webStyle}
                    </div>
                  </Field>

                  <ColorField label="Outer Palm Color" value={outerPalmColor} onChange={setOuterPalmColor} />
                  <ColorField label="Outer Thumb Color" value={outerThumbColor} onChange={setOuterThumbColor} />
                  <ColorField label="Outer Index Color" value={outerIndexColor} onChange={setOuterIndexColor} />
                  <ColorField label="Outer Middle Color" value={outerMiddleColor} onChange={setOuterMiddleColor} />
                  <ColorField label="Outer Ring Color" value={outerRingColor} onChange={setOuterRingColor} />
                  <ColorField label="Outer Pinky Color" value={outerPinkyColor} onChange={setOuterPinkyColor} />
                  <ColorField label="Wrist Color" value={wristColor} onChange={setWristColor} />

                  <ColorField label="Palm Color" value={palmColor} onChange={setPalmColor} />
                  <ColorField label="Inner Thumb Color" value={innerThumbColor} onChange={setInnerThumbColor} />
                  <ColorField label="Inner Index Color" value={innerIndexColor} onChange={setInnerIndexColor} />
                  <ColorField label="Inner Middle Color" value={innerMiddleColor} onChange={setInnerMiddleColor} />
                  <ColorField label="Inner Ring Color" value={innerRingColor} onChange={setInnerRingColor} />
                  <ColorField label="Inner Pinky Color" value={innerPinkyColor} onChange={setInnerPinkyColor} />

                  <ColorField label="Lace Color" value={laceColor} onChange={setLaceColor} />
                  <ColorField label="Web Color" value={webColor} onChange={setWebColor} />
                  <ColorField label="Binding Color" value={bindingColor} onChange={setBindingColor} />
                  <ColorField label="Welting Color" value={weltingColor} onChange={setWeltingColor} />
                  <ColorField label="Patch Color" value={patchColor} onChange={setPatchColor} />
                  <ColorField label="Palm Logo Color" value={palmLogoColor} onChange={setPalmLogoColor} />
                  <ColorField label="Logo Color" value={logoColor} onChange={setLogoColor} />

                </BuilderGroup>

                <BuilderGroup title="Step 4 — Personalization">
                  {canAddEmbroidery ? (
                    <>
                      <Field label="Embroidery Text">
                        <input
                          type="text"
                          maxLength={12}
                          value={embroideryText}
                          onChange={(e) =>
                            setEmbroideryText(e.target.value)
                          }
                          placeholder="Enter name or word"
                          className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                        />
                      </Field>

                      <Field label="Embroidery Color">
                        <select
                          value={embroideryColor}
                          onChange={(e) =>
                            setEmbroideryColor(e.target.value)
                          }
                          className="w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 outline-none"
                        >
                          {embroideryColorOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                      <p className="font-medium text-white">
                        Embroidery is included with the $229 custom series.
                      </p>

                      <p className="mt-2 text-sm text-neutral-400">
                        Select the $229 series to add personalized embroidery.
                      </p>
                    </div>
                  )}
                </BuilderGroup>
              </div>
            </section>

            <section className="self-start rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:rounded-3xl sm:p-6 lg:sticky lg:top-10">
              <h2 className="mb-6 text-2xl font-semibold">Preview</h2>

              <div className="h-[380px] sm:h-[500px] lg:h-[620px]">
                <Glove3DPreview
                  outerPalmColor={outerPalmColor}
                  outerThumbColor={outerThumbColor}
                  outerIndexColor={outerIndexColor}
                  outerMiddleColor={outerMiddleColor}
                  outerRingColor={outerRingColor}
                  outerPinkyColor={outerPinkyColor}
                  wristColor={wristColor}
                  palmColor={palmColor}
                  innerThumbColor={innerThumbColor}
                  innerIndexColor={innerIndexColor}
                  innerMiddleColor={innerMiddleColor}
                  innerRingColor={innerRingColor}
                  innerPinkyColor={innerPinkyColor}
                  laceColor={laceColor}
                  webColor={webColor}
                  bindingColor={bindingColor}
                  weltingColor={weltingColor}
                  patchColor={patchColor}
                  palmLogoColor={palmLogoColor}
                  logoColor={logoColor}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <PreviewChip label="Outer Palm" value={outerPalmColor} />
                <PreviewChip label="Outer Thumb" value={outerThumbColor} />
                <PreviewChip label="Outer Index" value={outerIndexColor} />
                <PreviewChip label="Outer Middle" value={outerMiddleColor} />
                <PreviewChip label="Outer Ring" value={outerRingColor} />
                <PreviewChip label="Outer Pinky" value={outerPinkyColor} />
                <PreviewChip label="Wrist" value={wristColor} />
                <PreviewChip label="Palm" value={palmColor} />
                <PreviewChip label="Inner Thumb" value={innerThumbColor} />
                <PreviewChip label="Inner Index" value={innerIndexColor} />
                <PreviewChip label="Inner Middle" value={innerMiddleColor} />
                <PreviewChip label="Inner Ring" value={innerRingColor} />
                <PreviewChip label="Inner Pinky" value={innerPinkyColor} />
                <PreviewChip label="Lace" value={laceColor} />
                <PreviewChip label="Web" value={webColor} />
                <PreviewChip label="Binding" value={bindingColor} />
                <PreviewChip label="Welting" value={weltingColor} />
                <PreviewChip label="Patch" value={patchColor} />
                <PreviewChip label="Palm Logo" value={palmLogoColor} />
                <PreviewChip label="Logo" value={logoColor} />
                {canAddEmbroidery ? (
                  <>
                    <PreviewChip
                      label="Embroidery"
                      value={embroideryText || "None"}
                    />

                    <PreviewChip
                      label="Embroidery Color"
                      value={embroideryText ? embroideryColor : "None"}
                    />
                  </>
                ) : null}
              </div>

              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Estimated Price</p>
                    <p className="text-4xl font-bold">${price}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                {errorMessage ? (
                  <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function BuilderGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-neutral-800 bg-neutral-950"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-base font-semibold text-white sm:px-5 sm:text-lg">
        <span>{title}</span>
        <span className="text-neutral-400 transition group-open:rotate-180">⌄</span>
      </summary>

      <div className="border-t border-neutral-800 px-4 py-5 sm:px-5">
        <div className="space-y-5">{children}</div>
      </div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
  options = panelColorOptions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}) {
  return (
    <Field label={label}>
      <ColorGrid options={options} value={value} onChange={onChange} />
    </Field>
  );
}

function PreviewChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function ColorGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((color) => {
        const isActive = value === color;

        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`rounded-2xl border px-3 py-3 text-left transition ${
              isActive
                ? "border-white bg-white text-black"
                : "border-neutral-700 bg-neutral-950 text-white hover:border-neutral-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-5 w-5 rounded-full border border-black/20"
                style={{ backgroundColor: colorMap[color] ?? "#999999" }}
              />
              <span className="text-sm">{color}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}