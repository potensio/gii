import { NextRequest, NextResponse } from "next/server";
import { chunkStore } from "@/lib/chunk-store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as Blob;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileName = formData.get("fileName") as string;
    const uploadId = formData.get("uploadId") as string;

    if (
      !chunk ||
      isNaN(chunkIndex) ||
      isNaN(totalChunks) ||
      !fileName ||
      !uploadId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert chunk to buffer
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store chunk
    chunkStore.setChunk(uploadId, chunkIndex, buffer);

    // Store metadata on first chunk
    if (chunkIndex === 0) {
      chunkStore.setMetadata(uploadId, {
        uploadId,
        fileName,
        totalChunks,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      uploadId,
    });
  } catch (error) {
    console.error("Error uploading chunk:", error);
    return NextResponse.json(
      { error: "Failed to upload chunk" },
      { status: 500 }
    );
  }
}
