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

interface MultiUploaderProps {
  defaultImages?: string[]; // For edit mode with existing images
  onImagesChange?: (urls: string[]) => void; // Callback when images change
}

export function MultiUploader({
  defaultImages = [],
  onImagesChange,
}: MultiUploaderProps = {}) {
  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        // Create instant preview URL
        const previewUrl = URL.createObjectURL(file);

        // Start upload in background
        const result = await uploadFileWithRetry(file, 3, (progress) => {
          console.log(
            `Uploading ${progress.fileName}: ${progress.progress.toFixed(0)}%`
          );
        });

        // Cleanup preview URL
        URL.revokeObjectURL(previewUrl);

        // Notify parent component
        if (onImagesChange) {
          onImagesChange([result.url]);
        }

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
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: 50 * 1024 * 1024, // Increased to 50MB for chunk upload
      maxFiles: 10,
    },
    maxRetryCount: 3,
    autoRetry: true,
  });

  return (
    <div className="not-prose flex flex-col gap-4">
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              Please select up to 10 images
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
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
    </div>
  );
}
