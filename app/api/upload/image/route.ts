import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${
            file.type
          }. Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 5MB` },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}