"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PrebuiltGlove = {
  id: number;
  slug: string;
  name: string;
  price: number | string;
  model: string;
  sport: string;
  color: string | null;
  description: string | null;
  image_url: string;
  is_active: boolean;
  stock_quantity: number;
};

type PrebuiltManagerProps = {
  gloves: PrebuiltGlove[];
};

const models = [
  "Fielder",
  "1B Open Back",
  "1B Closed Back",
  "Baseball Catcher",
  "Softball Catcher",
  "Batting Gloves",
];

const sports = [
  "Baseball",
  "Softball",
  "Youth Baseball",
  "Youth Softball",
];

export default function PrebuiltManager({
  gloves,
}: PrebuiltManagerProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("229");
  const [model, setModel] = useState("Fielder");
  const [sport, setSport] = useState("Baseball");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");

  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const [stockQuantity, setStockQuantity] = useState("1");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingGlove, setEditingGlove] =
    useState<PrebuiltGlove | null>(null);

  const [editStockQuantity, setEditStockQuantity] =
  useState("0");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSport, setEditSport] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setImage(file);

    if (!file) {
      setPreview("");
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  function handleEditImageChange(
    event: React.ChangeEvent<HTMLInputElement>
    ) {
    const file = event.target.files?.[0] ?? null;

    setEditImage(file);

    if (!file) {
        setEditImagePreview("");
        return;
    }

    setEditImagePreview(URL.createObjectURL(file));
  }

  async function toggleActive(glove: PrebuiltGlove) {
    try {
        const formData = new FormData();

        formData.append(
        "isActive",
        String(!glove.is_active)
        );

        formData.append("name", glove.name);
        formData.append("price", String(glove.price));  
        formData.append(
          "stockQuantity",
          String(glove.stock_quantity)
        );
        formData.append("model", glove.model);
        formData.append("sport", glove.sport);
        formData.append("color", glove.color ?? "");
        formData.append(
        "description",
        glove.description ?? ""
        );

        const response = await fetch(
        `/api/admin/prebuilt/${glove.id}`,
        {
            method: "PATCH",
            body: formData,
        }
        );

        const result = await response.json();

        if (!response.ok) {
        throw new Error(
            result.error || "Could not update glove."
        );
        }

        router.refresh();
    } catch (error) {
        console.error(error);

        alert(
        error instanceof Error
            ? error.message
            : "Could not update glove."
        );
    }
    }

    function startEditing(glove: PrebuiltGlove) {
        setEditingGlove(glove);

        setEditName(glove.name);
        setEditPrice(String(glove.price));
        setEditModel(glove.model);
        setEditSport(glove.sport);
        setEditStockQuantity(String(glove.stock_quantity));
        setEditColor(glove.color ?? "");
        setEditDescription(glove.description ?? "");

        setEditImage(null);
        setEditImagePreview("");
    }

    async function saveEdit() {
        if (!editingGlove) {
            return;
        }

        try {
            setIsSaving(true);
            setErrorMessage("");
            setMessage("");

            const formData = new FormData();

            formData.append("name", editName);
            formData.append("price", editPrice);
            formData.append("model", editModel);
            formData.append("sport", editSport);
            formData.append("color", editColor);
            formData.append("description", editDescription);
            formData.append(
              "stockQuantity",
              editStockQuantity
            );

            if (editImage) {
            formData.append("image", editImage);
            }

            const response = await fetch(
            `/api/admin/prebuilt/${editingGlove.id}`,
            {
                method: "PATCH",
                body: formData,
            }
            );

            const result = await response.json();

            if (!response.ok) {
            throw new Error(
                result.error || "The glove could not be updated."
            );
            }

            setEditingGlove(null);
            setEditImage(null);
            setEditImagePreview("");

            setMessage("Prebuilt glove updated.");

            router.refresh();
        } catch (error) {
            console.error(error);

            setErrorMessage(
            error instanceof Error
                ? error.message
                : "The glove could not be updated."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteGlove(glove: PrebuiltGlove) {
    const confirmed = window.confirm(
        `Delete "${glove.name}" permanently?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
        `/api/admin/prebuilt/${glove.id}`,
        {
            method: "DELETE",
        }
        );

        const result = await response.json();

        if (!response.ok) {
        throw new Error(
            result.error || "Could not delete glove."
        );
        }

        router.refresh();
    } catch (error) {
        console.error(error);

        alert(
        error instanceof Error
            ? error.message
            : "Could not delete glove."
        );
    }
    }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      setErrorMessage("");

      if (!image) {
        throw new Error("Select a glove image.");
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("model", model);
      formData.append("sport", sport);
      formData.append("color", color);
      formData.append("description", description);
      formData.append("image", image);
      formData.append("stockQuantity", stockQuantity);

      const response = await fetch(
        "/api/admin/prebuilt",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The glove could not be created."
        );
      }

      setName("");
      setPrice("229");
      setModel("Fielder");
      setSport("Baseball");
      setColor("");
      setDescription("");
      setImage(null);
      setPreview("");

      setMessage("Prebuilt glove added.");

      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The glove could not be created."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      {editingGlove ? (
        <div className="lg:col-span-2 rounded-3xl border border-neutral-700 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                Editing
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                {editingGlove.name}
                </h2>
            </div>

            <button
                type="button"
                onClick={() => setEditingGlove(null)}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm"
            >
                Cancel
            </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Glove Name">
                <input
                value={editName}
                onChange={(event) =>
                    setEditName(event.target.value)
                }
                className={inputClass}
                />
            </Field>

            <Field label="Price">
                <input
                type="number"
                min="1"
                step="0.01"
                value={editPrice}
                onChange={(event) =>
                    setEditPrice(event.target.value)
                }
                className={inputClass}
                />
            </Field>

            <Field label="Stock Quantity">
              <input
                required
                type="number"
                min="0"
                step="1"
                value={editStockQuantity}
                onChange={(event) =>
                  setEditStockQuantity(event.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Model">
                <select
                value={editModel}
                onChange={(event) =>
                    setEditModel(event.target.value)
                }
                className={inputClass}
                >
                {models.map((option) => (
                    <option key={option}>
                    {option}
                    </option>
                ))}
                </select>
            </Field>

            <Field label="Sport">
                <select
                value={editSport}
                onChange={(event) =>
                    setEditSport(event.target.value)
                }
                className={inputClass}
                >
                {sports.map((option) => (
                    <option key={option}>
                    {option}
                    </option>
                ))}
                </select>
            </Field>

            <Field label="Colors">
                <input
                value={editColor}
                onChange={(event) =>
                    setEditColor(event.target.value)
                }
                className={inputClass}
                />
            </Field>

            <div className="sm:col-span-2">
                <Field label="Description">
                <textarea
                    rows={5}
                    value={editDescription}
                    onChange={(event) =>
                    setEditDescription(event.target.value)
                    }
                    className={inputClass}
                />
                </Field>
            </div>

            <div className="sm:col-span-2">
                <Field label="Replace Image (optional)">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="block w-full text-sm text-neutral-300"
                />
                </Field>
            </div>

            <div className="sm:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="mb-2 text-sm text-neutral-400">
                    Current Image
                    </p>

                    <div className="overflow-hidden rounded-2xl bg-white">
                    <img
                        src={editingGlove.image_url}
                        alt={editingGlove.name}
                        className="h-64 w-full object-contain"
                    />
                    </div>
                </div>

                {editImagePreview ? (
                    <div>
                    <p className="mb-2 text-sm text-neutral-400">
                        New Image
                    </p>

                    <div className="overflow-hidden rounded-2xl bg-white">
                        <img
                        src={editImagePreview}
                        alt="New glove preview"
                        className="h-64 w-full object-contain"
                        />
                    </div>
                    </div>
                ) : null}
                </div>
            </div>
            </div>


            <button
            type="button"
            onClick={saveEdit}
            disabled={isSaving}
            className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-60"
            >
            {isSaving ? "Saving..." : "Save Changes"}
            </button>
        </div>
        ) : null}

      <section className="h-fit rounded-3xl border border-neutral-800 bg-neutral-900 p-6 lg:sticky lg:top-8">
        <h2 className="text-2xl font-semibold">
          Add Prebuilt Glove
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <Field label="Glove Name">
            <input
              required
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Spider-Man"
              className={inputClass}
            />
          </Field>

          <Field label="Price">
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              className={inputClass}
            />
          </Field>

          <Field label="Model">
            <select
              value={model}
              onChange={(event) =>
                setModel(event.target.value)
              }
              className={inputClass}
            >
              {models.map((option) => (
                <option key={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sport">
            <select
              value={sport}
              onChange={(event) =>
                setSport(event.target.value)
              }
              className={inputClass}
            >
              {sports.map((option) => (
                <option key={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Colors">
            <input
              value={color}
              onChange={(event) =>
                setColor(event.target.value)
              }
              placeholder="Red / Blue / Black / White"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe the glove..."
              className={inputClass}
            />
          </Field> 

          

          <Field label="Glove Image">
            <input
              required
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-neutral-300"
            />
          </Field>

          {preview ? (
            <div className="overflow-hidden rounded-2xl bg-white">
              <img
                src={preview}
                alt="Glove preview"
                className="h-64 w-full object-contain"
              />
            </div>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-green-900 bg-green-950/40 p-4 text-sm text-green-300">
              {message}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-60"
          >
            {isSaving
              ? "Adding Glove..."
              : "Add Prebuilt Glove"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">
          Supabase Prebuilt Gloves
        </h2>

        {gloves.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-neutral-400">
            No Supabase prebuilt gloves have been added yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {gloves.map((glove) => (
                <article
                    key={glove.id}
                    className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
                >
                    {/* Glove image */}
                    <div className="aspect-square bg-white">
                    <img
                        src={glove.image_url}
                        alt={glove.name}
                        className="h-full w-full object-contain"
                    />
                    </div>

                    <div className="p-5">

                    {/* Name + price */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                        <h3 className="text-xl font-semibold">
                            {glove.name}
                        </h3>

                        {/* Visible / Hidden badge */}
                        <span
                            className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
                            glove.is_active
                                ? "border-green-800 bg-green-950/50 text-green-300"
                                : "border-neutral-700 bg-neutral-800 text-neutral-400"
                            }`}
                        >
                            {glove.is_active ? "Visible" : "Hidden"}
                        </span>
                        </div>

                        <p className="font-bold">
                        ${Number(glove.price).toFixed(2)}
                        </p>
                    </div>

                    {/* Model and sport */}
                    <p className="mt-3 text-sm text-neutral-400">
                        {glove.model} · {glove.sport}
                    </p>

                    <p className="mt-2 text-sm">
                        {glove.stock_quantity > 0 ? (
                            <span className="text-green-400">
                            {glove.stock_quantity} in stock
                            </span>
                        ) : (
                            <span className="text-red-400">
                            Sold Out
                            </span>
                        )}
                    </p>

                    {/* Colors */}
                    {glove.color ? (
                        <p className="mt-2 text-sm text-neutral-500">
                        {glove.color}
                        </p>
                    ) : null}

                    {/* Description */}
                    {glove.description ? (
                        <p className="mt-4 text-sm leading-6 text-neutral-300">
                        {glove.description}
                        </p>
                    ) : null}

                    {/* Management buttons */}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => startEditing(glove)}
                            className="rounded-xl border border-neutral-700 px-3 py-2 text-sm font-semibold transition hover:border-neutral-500"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleActive(glove)}
                            className="rounded-xl border border-neutral-700 px-3 py-2 text-sm font-semibold transition hover:border-neutral-500"
                        >
                            {glove.is_active ? "Hide" : "Show"}
                        </button>

                        <button
                            type="button"
                            onClick={() => deleteGlove(glove)}
                            className="rounded-xl border border-red-900 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-950"
                        >
                            Delete
                        </button>
                    </div>

                    </div>
                </article>
                ))}
          </div>
        )}
      </section>
    </div>
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

const inputClass =
  "w-full rounded-2xl border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-neutral-500";