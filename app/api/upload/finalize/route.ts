import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { chunkStore } from "@/lib/chunk-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, uploadId, totalChunks } = body;

    if (!fileName || !uploadId || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get all chunks
    const chunks = chunkStore.getAllChunks(uploadId);
    if (!chunks || !chunkStore.hasAllChunks(uploadId, totalChunks)) {
      return NextResponse.json(
        { error: "Not all chunks received" },
        { status: 400 }
      );
    }

    // Combine chunks in order
    const orderedChunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks.get(i);
      if (!chunk) {
        return NextResponse.json(
          { error: `Missing chunk ${i}` },
          { status: 400 }
        );
      }
      orderedChunks.push(chunk);
    }

    const completeFile = Buffer.concat(orderedChunks);

    // Upload to Vercel Blob
    const blob = await put(fileName, completeFile, {
      access: "public",
    });

    // Clean up chunks from memory
    chunkStore.delete(uploadId);

    return NextResponse.json({
      url: blob.url,
      fileName,
      size: completeFile.length,
    });
  } catch (error) {
    console.error("Error finalizing upload:", error);
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 }
    );
  }
}
