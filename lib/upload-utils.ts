/**
 * Upload utilities for handling file chunking and upload to Vercel Blob
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

export interface ChunkUploadProgress {
  fileId: string;
  fileName: string;
  totalChunks: number;
  uploadedChunks: number;
  progress: number;
}

export interface ChunkUploadResult {
  url: string;
  fileName: string;
  size: number;
}

/**
 * Split file into chunks
 */
export function splitFileIntoChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    chunks.push(chunk);
    offset += CHUNK_SIZE;
  }

  return chunks;
}

/**
 * Generate unique file name to avoid collisions
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, "");
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");

  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Upload a single chunk to the server
 */
async function uploadChunk(
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  fileName: string,
  uploadId: string
): Promise<void> {
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("chunkIndex", chunkIndex.toString());
  formData.append("totalChunks", totalChunks.toString());
  formData.append("fileName", fileName);
  formData.append("uploadId", uploadId);

  const response = await fetch("/api/upload/chunk", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload chunk");
  }
}

/**
 * Finalize the upload and get the final URL
 */
async function finalizeUpload(
  fileName: string,
  uploadId: string,
  totalChunks: number
): Promise<ChunkUploadResult> {
  const response = await fetch("/api/upload/finalize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      uploadId,
      totalChunks,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to finalize upload");
  }

  return response.json();
}

/**
 * Upload file with chunking and progress tracking
 */
export async function uploadFileWithChunks(
  file: File,
  onProgress?: (progress: ChunkUploadProgress) => void
): Promise<ChunkUploadResult> {
  const uploadId = crypto.randomUUID();
  const uniqueFileName = generateUniqueFileName(file.name);
  const chunks = splitFileIntoChunks(file);
  const totalChunks = chunks.length;

  // Upload each chunk
  for (let i = 0; i < chunks.length; i++) {
    await uploadChunk(chunks[i], i, totalChunks, uniqueFileName, uploadId);

    // Report progress
    if (onProgress) {
      onProgress({
        fileId: uploadId,
        fileName: file.name,
        totalChunks,
        uploadedChunks: i + 1,
        progress: ((i + 1) / totalChunks) * 100,
      });
    }
  }

  // Finalize upload
  const result = await finalizeUpload(uniqueFileName, uploadId, totalChunks);

  return {
    ...result,
    fileName: file.name, // Return original file name
  };
}

/**
 * Upload file with retry logic
 */
export async function uploadFileWithRetry(
  file: File,
  maxRetries = 3,
  onProgress?: (progress: ChunkUploadProgress) => void
): Promise<ChunkUploadResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadFileWithChunks(file, onProgress);
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt + 1} failed:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Upload failed after multiple retries");
}
