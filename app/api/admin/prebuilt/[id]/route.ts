import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const email = user.email?.trim().toLowerCase();

  return Boolean(
    email && getAdminEmails().includes(email)
  );
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const gloveId = Number(id);

  if (!Number.isInteger(gloveId)) {
    return NextResponse.json(
      { error: "Invalid glove ID." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    const isActiveValue = formData.get("isActive");

    const isActive =
    isActiveValue !== null
        ? String(isActiveValue) === "true"
        : undefined;

    const name = String(
      formData.get("name") ?? ""
    ).trim();

    const price = Number(
      formData.get("price")
    );
    const stockQuantity = Number(
      formData.get("stockQuantity")
    );

    const model = String(
      formData.get("model") ?? ""
    ).trim();

    const sport = String(
      formData.get("sport") ?? ""
    ).trim();

    const color = String(
      formData.get("color") ?? ""
    ).trim();

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const image = formData.get("image");

    if (
      !name ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0 ||
      !model ||
      !sport
    ) {
      return NextResponse.json(
        {
          error:
            "Required glove information is missing.",
        },
        { status: 400 }
      );
    }

    const {
      data: existingGlove,
      error: existingGloveError,
    } = await supabaseAdmin
      .from("prebuilt_gloves")
      .select("*")
      .eq("id", gloveId)
      .single();

    if (existingGloveError || !existingGlove) {
      return NextResponse.json(
        { error: "Glove not found." },
        { status: 404 }
      );
    }

    let imageUrl = existingGlove.image_url;
    let newFilePath: string | null = null;

    /*
     * If the admin selected a replacement image,
     * upload it before updating the database.
     */
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error:
              "The uploaded file must be an image.",
          },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "The image must be smaller than 5 MB.",
          },
          { status: 400 }
        );
      }

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      newFilePath =
        `${existingGlove.slug}/${crypto.randomUUID()}.${extension}`;

      const arrayBuffer =
        await image.arrayBuffer();

      const fileBuffer =
        Buffer.from(arrayBuffer);

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from("prebuilt-gloves")
          .upload(
            newFilePath,
            fileBuffer,
            {
              contentType: image.type,
              upsert: false,
            }
          );

      if (uploadError) {
        console.error(
          "Replacement image upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            error:
              "The replacement image could not be uploaded.",
          },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from("prebuilt-gloves")
        .getPublicUrl(newFilePath);

      imageUrl = publicUrl;
    }

    const { data: updatedGlove, error: updateError } =
      await supabaseAdmin
        .from("prebuilt_gloves")
        .update({
            name,
            price,
            model,
            sport,
            color: color || null,
            description: description || null,
            stock_quantity: stockQuantity,
            image_url: imageUrl,

            ...(isActive !== undefined
                ? { is_active: isActive }
                : {}),

            updated_at: new Date().toISOString(),
        })
        .eq("id", gloveId)
        .select("*")
        .single();

    /*
     * If the database update failed after uploading a
     * replacement image, remove the new uploaded file.
     */
    if (updateError || !updatedGlove) {
      console.error(
        "Prebuilt glove update error:",
        updateError
      );

      if (newFilePath) {
        await supabaseAdmin.storage
          .from("prebuilt-gloves")
          .remove([newFilePath]);
      }

      return NextResponse.json(
        {
          error:
            "The glove could not be updated.",
        },
        { status: 500 }
      );
    }

    /*
     * Database update succeeded.
     * If we replaced the image, remove the old one.
     */
    if (
      newFilePath &&
      existingGlove.image_url &&
      existingGlove.image_url !== imageUrl
    ) {
      const marker =
        "/storage/v1/object/public/prebuilt-gloves/";

      if (
        existingGlove.image_url.includes(marker)
      ) {
        const oldFilePath =
          decodeURIComponent(
            existingGlove.image_url.split(marker)[1]
          );

        if (oldFilePath) {
          const { error: removeError } =
            await supabaseAdmin.storage
              .from("prebuilt-gloves")
              .remove([oldFilePath]);

          if (removeError) {
            console.error(
              "Could not remove old prebuilt image:",
              removeError
            );
          }
        }
      }
    }

    return NextResponse.json({
      glove: updatedGlove,
    });
  } catch (error) {
    console.error(
      "Prebuilt glove update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The glove could not be updated.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const gloveId = Number(id);

  if (!Number.isInteger(gloveId)) {
    return NextResponse.json(
      { error: "Invalid glove ID." },
      { status: 400 }
    );
  }

  const { data: glove, error: lookupError } =
    await supabaseAdmin
      .from("prebuilt_gloves")
      .select("id, image_url")
      .eq("id", gloveId)
      .single();

  if (lookupError || !glove) {
    return NextResponse.json(
      { error: "Glove not found." },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabaseAdmin
    .from("prebuilt_gloves")
    .delete()
    .eq("id", gloveId);

  if (deleteError) {
    console.error(deleteError);

    return NextResponse.json(
      { error: "The glove could not be deleted." },
      { status: 500 }
    );
  }

  // Remove its image from Supabase Storage too.
  const marker =
    "/storage/v1/object/public/prebuilt-gloves/";

  if (glove.image_url?.includes(marker)) {
    const filePath = decodeURIComponent(
      glove.image_url.split(marker)[1]
    );

    if (filePath) {
      await supabaseAdmin.storage
        .from("prebuilt-gloves")
        .remove([filePath]);
    }
  }

  return NextResponse.json({ success: true });
}