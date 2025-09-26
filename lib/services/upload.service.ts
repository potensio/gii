import { put, del } from "@vercel/blob";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

export interface BlobUploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}

export class UploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  /**
   * Upload a single file to Vercel Blob
   */
  static async uploadFile(file: File): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

      return {
        success: true,
        url: blob.url,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Upload multiple files to Vercel Blob
   */
  static async uploadFiles(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Vercel Blob
   */
  static async deleteFile(
    url: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await del(url);
      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  /**
   * Delete multiple files from Vercel Blob
   */
  static async deleteFiles(
    urls: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await Promise.all(urls.map((url) => del(url)));
      return { success: true };
    } catch (error) {
      console.error("Delete multiple files error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(
          ", "
        )}`,
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size too large. Maximum size: ${
          this.MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple files
   */
  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.valid && validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}