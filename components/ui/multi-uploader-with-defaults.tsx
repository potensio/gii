"use client";

import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { uploadFileWithRetry } from "@/lib/upload-utils";
import { CloudUploadIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ExistingImage {
  id: string;
  url: string;
  fileName?: string;
}

interface MultiUploaderWithDefaultsProps {
  defaultImages?: ExistingImage[]; // Existing images for edit mode
  onImagesChange?: (urls: string[]) => void; // Callback with all image URLs
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function MultiUploaderWithDefaults({
  defaultImages = [],
  onImagesChange,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg"],
  },
}: MultiUploaderWithDefaultsProps) {
  const [existingImages, setExistingImages] =
    useState<ExistingImage[]>(defaultImages);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Notify parent when images change
  useEffect(() => {
    if (onImagesChange) {
      const allUrls = [
        ...existingImages.map((img) => img.url),
        ...uploadedUrls,
      ];
      onImagesChange(allUrls);
    }
  }, [existingImages, uploadedUrls, onImagesChange]);

  const handleRemoveExisting = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        const result = await uploadFileWithRetry(file, 3, (progress) => {
          console.log(
            `Uploading ${progress.fileName}: ${progress.progress.toFixed(0)}%`
          );
        });

        // Add to uploaded URLs
        setUploadedUrls((prev) => [...prev, result.url]);

        return {
          status: "success",
          result: result.url,
        };
      } catch (error) {
        console.error("Upload failed:", error);
        return {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    onRemoveFile: async (id: string) => {
      // Remove from uploaded URLs
      const fileStatus = dropzone.fileStatuses.find((f) => f.id === id);
      if (fileStatus?.status === "success") {
        setUploadedUrls((prev) =>
          prev.filter((url) => url !== fileStatus.result)
        );
      }
    },
    validation: {
      accept,
      maxSize,
      maxFiles: maxFiles - existingImages.length, // Account for existing images
    },
    maxRetryCount: 3,
    autoRetry: true,
  });

  const totalImages = existingImages.length + dropzone.fileStatuses.length;
  const remainingSlots = maxFiles - totalImages;

  return (
    <div className="not-prose flex flex-col gap-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Existing images ({existingImages.length})
          </p>
          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.fileName || "Existing image"}
                  className="aspect-video object-cover"
                />
                <div className="flex items-center justify-between p-2 pl-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {image.fileName || "Existing image"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:outline"
                    onClick={() => handleRemoveExisting(image.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Images */}
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              {remainingSlots > 0
                ? `Upload up to ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""}`
                : "Maximum images reached"}
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
          {remainingSlots > 0 && (
            <DropZoneArea>
              <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
                <CloudUploadIcon className="size-8" />
                <div>
                  <p className="font-semibold">Upload listing images</p>
                  <p className="text-sm text-muted-foreground">
                    Click here or drag and drop to upload
                  </p>
                </div>
              </DropzoneTrigger>
            </DropZoneArea>
          )}
        </div>

        <DropzoneFileList className="grid grid-cols-3 gap-3 p-0">
          {dropzone.fileStatuses.map((file) => (
            <DropzoneFileListItem
              className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
              key={file.id}
              file={file}
            >
              {file.status === "pending" && (
                <div className="relative aspect-video">
                  {/* Show preview immediately */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file.file)}
                    alt={`preview-${file.fileName}`}
                    className="aspect-video object-cover"
                  />
                  {/* Loading overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                      <p className="text-xs text-white">Uploading...</p>
                    </div>
                  </div>
                </div>
              )}
              {file.status === "success" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.result}
                  alt={`uploaded-${file.fileName}`}
                  className="aspect-video object-cover"
                />
              )}
              {file.status === "error" && (
                <div className="flex aspect-video items-center justify-center bg-destructive/10">
                  <p className="text-sm text-destructive">Failed</p>
                </div>
              )}
              <div className="flex items-center justify-between p-2 pl-4">
                <div className="min-w-0">
                  <p className="truncate text-sm">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <DropzoneRemoveFile
                  variant="ghost"
                  className="shrink-0 hover:outline"
                >
                  <Trash2Icon className="size-4" />
                </DropzoneRemoveFile>
              </div>
            </DropzoneFileListItem>
          ))}
        </DropzoneFileList>
      </Dropzone>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total: {totalImages} / {maxFiles} images
      </div>
    </div>
  );
}
