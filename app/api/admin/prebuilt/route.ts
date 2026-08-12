import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      allowed: false as const,
      status: 401,
      message: "You must be signed in.",
    };
  }

  const email = user.email?.trim().toLowerCase();
  const adminEmails = getAdminEmails();

  if (!email || !adminEmails.includes(email)) {
    return {
      allowed: false as const,
      status: 403,
      message: "You do not have permission to manage prebuilt gloves.",
    };
  }

  return {
    allowed: true as const,
    user,
  };
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();

    if (!auth.allowed) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const stockQuantity = Number(
        formData.get("stockQuantity")
    );
    const model = String(formData.get("model") ?? "").trim();
    const sport = String(formData.get("sport") ?? "").trim();
    const color = String(formData.get("color") ?? "").trim();
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
            { error: "Required glove information is missing." },
            { status: 400 }
        );
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "A glove image is required." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "The uploaded file must be an image." },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "The image must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    let slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        { error: "Could not create a valid glove URL." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("prebuilt_gloves")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const extension =
      image.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension = extension.replace(
      /[^a-z0-9]/g,
      ""
    );

    const filePath =
      `${slug}/${crypto.randomUUID()}.${safeExtension}`;

    const arrayBuffer = await image.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("prebuilt-gloves")
        .upload(filePath, fileBuffer, {
          contentType: image.type,
          upsert: false,
        });

    if (uploadError) {
      console.error("Prebuilt upload error:", uploadError);

      return NextResponse.json(
        { error: "The glove image could not be uploaded." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("prebuilt-gloves")
      .getPublicUrl(filePath);

    const { data: glove, error: insertError } =
      await supabaseAdmin
        .from("prebuilt_gloves")
        .insert({
          slug,
          name,
          price,
          model,
          sport,
          color: color || null,
          description: description || null,
          image_url: publicUrl,
          stock_quantity: stockQuantity,
          is_active: true,
        })
        .select("*")
        .single();

    if (insertError || !glove) {
      console.error(
        "Prebuilt glove insert error:",
        insertError
      );

      await supabaseAdmin.storage
        .from("prebuilt-gloves")
        .remove([filePath]);

      return NextResponse.json(
        { error: "The glove could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      glove,
    });
  } catch (error) {
    console.error("Create prebuilt glove error:", error);

    return NextResponse.json(
      { error: "The glove could not be created." },
      { status: 500 }
    );
  }
}