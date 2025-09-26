"use client";

import { useState } from "react";
import { Images, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProductImage } from "./types";
import { FieldErrors } from "react-hook-form";
import { CreateProductFormData } from "@/lib/schemas/product-form.schema";

interface ProductImagesSectionProps {
  images: ProductImage[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetThumbnail: (imageId: string) => void;
  onRemoveImage: (imageId: string) => void;
  errors?: FieldErrors<CreateProductFormData>;
}

export function ProductImagesSection({
  images,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onSetThumbnail,
  onRemoveImage,
  errors,
}: ProductImagesSectionProps) {
  const imagesError = errors?.images;
  const uploadedImagesError = errors?.uploadedImages;
  
  return (
    <section className="space-y-4">
      <h2 className="font-semibold tracking-tight border-b pb-2">
        Galeri Produk
      </h2>

      {/* Error messages */}
      {imagesError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {imagesError.message}
        </div>
      )}
      {uploadedImagesError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {uploadedImagesError.message}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg py-10 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          (imagesError || uploadedImagesError) ? "border-destructive" : ""
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onFileInputChange}
          className="hidden"
          id="image-upload"
        />
        <Images className="size-5 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop images or{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer transition-colors"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            click to browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Support: JPG, PNG, GIF up to 10MB each
        </p>
        {(imagesError || uploadedImagesError) && (
          <p className="text-xs text-destructive mt-2">
            {images.length === 0 ? "Minimal 1 gambar harus diunggah" : "Pilih 1 gambar sebagai thumbnail"}
          </p>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Uploaded Images ({images.length})
            </p>
            <p className="text-xs text-muted-foreground">
              Click star to set as thumbnail
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  image.isThumbnail
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <img
                  src={image.preview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />

                {/* Thumbnail Badge */}
                {image.isThumbnail && (
                  <div className="absolute top-1 left-1">
                    <Badge variant="default" className="text-xs px-1 py-0">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Thumbnail
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!image.isThumbnail && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={() => onSetThumbnail(image.id)}
                      title="Set as thumbnail"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => onRemoveImage(image.id)}
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}