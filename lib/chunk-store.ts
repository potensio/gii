/**
 * Temporary chunk storage
 * In production, replace with Redis or similar persistent storage
 */

export interface ChunkMetadata {
  uploadId: string;
  fileName: string;
  totalChunks: number;
  createdAt: number;
}

class ChunkStore {
  private chunks = new Map<string, Map<number, Buffer>>();
  private metadata = new Map<string, ChunkMetadata>();

  /**
   * Store a chunk
   */
  setChunk(uploadId: string, chunkIndex: number, buffer: Buffer): void {
    if (!this.chunks.has(uploadId)) {
      this.chunks.set(uploadId, new Map());
    }
    const uploadChunks = this.chunks.get(uploadId)!;
    uploadChunks.set(chunkIndex, buffer);
  }

  /**
   * Get a specific chunk
   */
  getChunk(uploadId: string, chunkIndex: number): Buffer | undefined {
    return this.chunks.get(uploadId)?.get(chunkIndex);
  }

  /**
   * Get all chunks for an upload
   */
  getAllChunks(uploadId: string): Map<number, Buffer> | undefined {
    return this.chunks.get(uploadId);
  }

  /**
   * Check if all chunks are received
   */
  hasAllChunks(uploadId: string, totalChunks: number): boolean {
    const uploadChunks = this.chunks.get(uploadId);
    if (!uploadChunks) return false;
    return uploadChunks.size === totalChunks;
  }

  /**
   * Store metadata
   */
  setMetadata(uploadId: string, metadata: ChunkMetadata): void {
    this.metadata.set(uploadId, metadata);
  }

  /**
   * Get metadata
   */
  getMetadata(uploadId: string): ChunkMetadata | undefined {
    return this.metadata.get(uploadId);
  }

  /**
   * Delete all data for an upload
   */
  delete(uploadId: string): void {
    this.chunks.delete(uploadId);
    this.metadata.delete(uploadId);
  }

  /**
   * Cleanup old uploads (older than 1 hour)
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [uploadId, metadata] of this.metadata.entries()) {
      if (metadata.createdAt < oneHourAgo) {
        this.delete(uploadId);
      }
    }
  }

  /**
   * Get store statistics
   */
  getStats() {
    return {
      activeUploads: this.chunks.size,
      totalChunks: Array.from(this.chunks.values()).reduce(
        (sum, chunks) => sum + chunks.size,
        0
      ),
    };
  }
}

// Singleton instance
export const chunkStore = new ChunkStore();

// Cleanup every 10 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      chunkStore.cleanup();
    },
    10 * 60 * 1000
  );
}
