"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { SubDescription } from "./types";
import { FieldErrors } from "react-hook-form";
import { CreateProductFormData } from "@/lib/schemas/product-form.schema";

interface SubDescriptionsSectionProps {
  subDescriptions: SubDescription[];
  onAddSubDescription: () => void;
  onRemoveSubDescription: (id: string) => void;
  onUpdateSubDescription: (
    id: string,
    field: "title" | "content",
    value: string
  ) => void;
  errors?: FieldErrors<CreateProductFormData>;
}

export function SubDescriptionsSection({
  subDescriptions,
  onAddSubDescription,
  onRemoveSubDescription,
  onUpdateSubDescription,
  errors,
}: SubDescriptionsSectionProps) {
  const subDescriptionsError = errors?.subDescriptions;
  const hasGeneralError = typeof subDescriptionsError === 'object' && 'message' in subDescriptionsError;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="font-semibold tracking-tight">Sub Deskripsi</h2>
        <Button onClick={onAddSubDescription} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Sub Deskripsi
        </Button>
      </div>

      {/* General error for subDescriptions array */}
      {hasGeneralError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {subDescriptionsError.message}
        </div>
      )}

      <div className="space-y-4">
        {subDescriptions.map((subDesc, index) => {
          const fieldError = Array.isArray(subDescriptionsError) ? subDescriptionsError[index] : null;
          const titleError = fieldError?.title;
          const contentError = fieldError?.content;

          return (
            <Card key={subDesc.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Sub Deskripsi {index + 1}
                  </Label>
                  {subDescriptions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSubDescription(subDesc.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`sub-title-${subDesc.id}`}>Judul</Label>
                    <Input
                      id={`sub-title-${subDesc.id}`}
                      placeholder="e.g., Fabric & Fit, Care Instructions"
                      value={subDesc.title}
                      onChange={(e) =>
                        onUpdateSubDescription(
                          subDesc.id,
                          "title",
                          e.target.value
                        )
                      }
                      className={titleError ? "border-destructive" : ""}
                    />
                    {titleError && (
                      <p className="text-sm text-destructive">
                        {titleError.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`sub-content-${subDesc.id}`}>Konten</Label>
                    <Textarea
                      id={`sub-content-${subDesc.id}`}
                      placeholder="Masukkan detail deskripsi..."
                      className={`min-h-[80px] ${contentError ? "border-destructive" : ""}`}
                      value={subDesc.content}
                      onChange={(e) =>
                        onUpdateSubDescription(
                          subDesc.id,
                          "content",
                          e.target.value
                        )
                      }
                    />
                    {contentError && (
                      <p className="text-sm text-destructive">
                        {contentError.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {subDescriptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Belum ada sub deskripsi.</p>
            <p className="text-xs">
              Klik "Tambah Sub Deskripsi" untuk menambahkan.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}