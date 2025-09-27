"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  VARIANT_ATTRIBUTE_TYPES,
  ProductVariant,
  ProductImage,
  SubDescription,
  ProductSheetProps,
  VariantAttribute,
} from "./types";
import { VariantAttributeType } from "@/lib/generated/prisma/enums";
import { ProductInformationSection } from "./product-information-section";
import { SubDescriptionsSection } from "./sub-descriptions-section";
import { ProductImagesSection } from "./product-images-section";
import { ProductVariantsSection } from "./product-variants-section";
import { SEOSection } from "./seo-section";
import {
  createProductFormSchema,
  defaultProductFormValues,
  type CreateProductFormData,
} from "@/lib/schemas/product-form.schema";
import { useCreateProductWithForm, useUpdateProductWithForm } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { transformProductToFormData } from "@/lib/adapters/product-form.adapter";

export function ProductSheet({
  isOpen,
  onClose,
  mode = "create",
  productToEdit,
}: ProductSheetProps) {
  const { toast } = useToast();

  // React Hook Form setup with dynamic default values
  const getDefaultValues = React.useMemo(() => {
    if (mode === "edit" && productToEdit) {
      // Transform product data to form data format
      const transformedData = transformProductToFormData(productToEdit);
      return {
        ...defaultProductFormValues,
        ...transformedData,
      };
    }
    return defaultProductFormValues;
  }, [mode, productToEdit]);

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: getDefaultValues,
    mode: "onChange", // Validate on change for real-time feedback
    reValidateMode: "onChange", // Re-validate on change after first error
  });

  const {
    watch,
    setValue,
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  // Watch form values for reactive updates
  const watchedValues = watch();

  // Create product mutation
  const createProductMutation = useCreateProductWithForm();
  
  // Update product mutation
  const updateProductMutation = useUpdateProductWithForm();

  // UI state for drag and drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [open, setOpen] = useState(false);

  // Get form values for complex fields
  const subDescriptions = watchedValues.subDescriptions || [];
  const images = watchedValues.images || [];
  const selectedAttributes = watchedValues.selectedAttributes || [];
  const variants = watchedValues.variants || [];
  const hasVariants = watchedValues.hasVariants || false;

  // Helper functions to update form values
  const setSubDescriptions = (newSubDescriptions: SubDescription[]) => {
    setValue("subDescriptions", newSubDescriptions);
  };

  const setImages = (newImages: ProductImage[]) => {
    setValue("images", newImages);
  };

  const setSelectedAttributes = (newAttributes: VariantAttributeType[]) => {
    setValue("selectedAttributes", newAttributes);
  };

  const setVariants = (newVariants: ProductVariant[]) => {
    setValue("variants", newVariants);
  };

  // Handle hasVariants toggle
  const handleHasVariantsChange = (hasVariants: boolean) => {
    setValue("hasVariants", hasVariants);

    // Clear variant-related fields when switching to simple product
    if (!hasVariants) {
      setValue("selectedAttributes", []);
      setValue("variants", []);
    }
  };

  // Reset form when productToEdit changes (for edit mode)
  React.useEffect(() => {
    if (mode === "edit" && productToEdit) {
      const transformedData = transformProductToFormData(productToEdit);
      const newFormData = {
        ...defaultProductFormValues,
        ...transformedData,
      };
      form.reset(newFormData);
    } else if (mode === "create") {
      form.reset(defaultProductFormValues);
    }
  }, [mode, productToEdit, form]);

  // Update variants when selected attributes change
  React.useEffect(() => {
    const currentVariants = getValues("variants") || [];
    const updatedVariants = currentVariants.map((variant: ProductVariant) => ({
      ...variant,
      attributes: selectedAttributes.map((attrType) => {
        const existingAttr = variant.attributes.find(
          (attr: VariantAttribute) => attr.type === attrType
        );
        const attrLabel =
          VARIANT_ATTRIBUTE_TYPES.find((type) => type.value === attrType)
            ?.label || attrType;

        return (
          existingAttr || {
            type: attrType as VariantAttributeType,
            name: attrLabel,
            value: "",
          }
        );
      }),
    }));
    setValue("variants", updatedVariants);
  }, [selectedAttributes, setValue, getValues]);

  // Handle category change
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      attributes: selectedAttributes.map((attrType) => {
        const attrLabel =
          VARIANT_ATTRIBUTE_TYPES.find((type) => type.value === attrType)
            ?.label || attrType;

        return {
          type: attrType as VariantAttributeType,
          name: attrLabel,
          value: "",
        };
      }),
      price: "",
      stock: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((variant) => variant.id !== id));
  };

  const updateVariantAttribute = (
    variantId: string,
    attributeType: string,
    value: string
  ) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === variantId
        ? {
            ...variant,
            attributes: variant.attributes.map((attr) =>
              attr.type === attributeType ? { ...attr, value } : attr
            ),
          }
        : variant
    );
    setVariants(updatedVariants);
  };

  const updateVariantField = (
    variantId: string,
    field: "price" | "stock" | "sku",
    value: string
  ) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === variantId ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  // Sub-descriptions helper functions
  const addSubDescription = () => {
    const newSubDescription: SubDescription = {
      id: Date.now().toString(),
      title: "",
      content: "",
    };
    setSubDescriptions([...subDescriptions, newSubDescription]);
  };

  const removeSubDescription = (id: string) => {
    setSubDescriptions(subDescriptions.filter((sub) => sub.id !== id));
  };

  const updateSubDescription = (
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    const updatedSubDescriptions = subDescriptions.map((sub) =>
      sub.id === id ? { ...sub, [field]: value } : sub
    );
    setSubDescriptions(updatedSubDescriptions);
  };

  const handleAttributeSelect = (attributeValue: VariantAttributeType) => {
    const updatedAttributes = selectedAttributes.includes(attributeValue)
      ? selectedAttributes.filter((item) => item !== attributeValue)
      : [...selectedAttributes, attributeValue];
    setSelectedAttributes(updatedAttributes);
  };

  // Image upload handlers
  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    const newImages: ProductImage[] = validFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      isThumbnail: false,
    }));

    setImages([...images, ...newImages]);

    // Set first image as thumbnail if no thumbnail exists
    const updatedImages = [...images, ...newImages];
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isThumbnail)
    ) {
      updatedImages[0].isThumbnail = true;
      setImages(updatedImages);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect]
  );

  const setThumbnail = useCallback(
    (imageId: string) => {
      const updatedImages = images.map((img) => ({
        ...img,
        isThumbnail: img.id === imageId,
      }));
      setImages(updatedImages);
    },
    [images]
  );

  const removeImage = useCallback(
    (imageId: string) => {
      const filtered = images.filter((img) => img.id !== imageId);
      const removedImage = images.find((img) => img.id === imageId);

      // If removed image was thumbnail, set first remaining image as thumbnail
      if (removedImage?.isThumbnail && filtered.length > 0) {
        filtered[0].isThumbnail = true;
      }

      // Clean up object URL
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }

      setImages(filtered);
    },
    [images]
  );

  const handleSave = handleSubmit(
    async (data: CreateProductFormData) => {
      try {
        // Clear any previous errors
        clearErrors("root");

        // Upload images to Vercel Blob first if there are any
        let uploadedImages: Array<{
          url: string;
          filename: string;
          originalName: string;
          size: number;
          type: string;
          isMain: boolean;
        }> = [];

        if (data.images && data.images.length > 0) {
          try {
            // Separate new images (with file) from existing images
            const newImages = data.images.filter(image => image.file && !image.isExisting);
            const existingImages = data.images.filter(image => image.isExisting);

            // Only upload new images if there are any
            if (newImages.length > 0) {
              // Create FormData for new image upload
              const formData = new FormData();
              newImages.forEach((image, index) => {
                if (image.file) {
                  formData.append("files", image.file);
                  formData.append(
                    `metadata_${index}`,
                    JSON.stringify({
                      isThumbnail: image.isThumbnail,
                      altText: `${data.productName} - Image ${index + 1}`,
                    })
                  );
                }
              });

              // Upload new images to Vercel Blob
              const uploadResponse = await fetch("/api/upload/images", {
                method: "POST",
                body: formData,
              });

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || "Failed to upload images");
              }

              const uploadResult = await uploadResponse.json();

              if (!uploadResult.success || !uploadResult.files) {
                throw new Error("Invalid upload response");
              }

              // Map uploaded new images with form metadata
              const newUploadedImages = uploadResult.files.map(
                (uploadedFile: any, index: number) => {
                  const originalImage = newImages[index];
                  return {
                    url: uploadedFile.url,
                    filename: uploadedFile.filename,
                    originalName: uploadedFile.originalName,
                    size: uploadedFile.size,
                    type: uploadedFile.type,
                    isMain: originalImage?.isThumbnail || false,
                  };
                }
              );

              // Combine new uploaded images with existing images
              uploadedImages = [
                ...newUploadedImages,
                ...existingImages.map(image => ({
                  url: image.existingImageData?.url || image.preview,
                  filename: image.existingImageData?.publicId || image.id,
                  originalName: image.existingImageData?.publicId || image.id,
                  size: 0, // Size not available for existing images
                  type: 'image/jpeg', // Default type for existing images
                  isMain: image.isThumbnail,
                }))
              ];
            } else {
              // No new images to upload, just use existing images
              uploadedImages = existingImages.map(image => ({
                url: image.existingImageData?.url || image.preview,
                filename: image.existingImageData?.publicId || image.id,
                originalName: image.existingImageData?.publicId || image.id,
                size: 0,
                type: 'image/jpeg',
                isMain: image.isThumbnail,
              }));
            }
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            setError("root.uploadError", {
              type: "manual",
              message:
                uploadError instanceof Error
                  ? `Image upload failed: ${uploadError.message}`
                  : "Failed to upload images. Please try again.",
            });
            return;
          }
        }

        // Create modified form data with uploaded image URLs
        const modifiedData = {
          ...data,
          uploadedImages, // Add uploaded images data
        };

        // Use appropriate mutation based on mode
        if (mode === "edit" && productToEdit) {
          await updateProductMutation.mutateAsync({
            productId: productToEdit.id,
            formData: modifiedData,
          });
          
          toast({
            title: "Success",
            description: "Product updated successfully!",
          });
        } else {
          // Use the mutation to create the product
          await createProductMutation.mutateAsync(modifiedData);

          toast({
            title: "Success",
            description: "Product created successfully!",
          });
        }

        // Close the sheet on success
        onClose();
      } catch (error) {
        console.error("Product creation error:", error);

        if (error instanceof Error) {
          // Handle specific error types that require root-level errors
          if (error.message.includes("already exists")) {
            setError("root.duplicateError", {
              type: "manual",
              message:
                "A product with this slug already exists. Please use a different slug.",
            });
            toast({
              title: "Duplicate Product",
              description:
                "A product with this slug already exists. Please use a different slug.",
              variant: "destructive",
            });
          } else {
            // Handle server/network errors
            setError("root.serverError", {
              type: "manual",
              message: error.message,
            });
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          setError("root.unexpectedError", {
            type: "manual",
            message: "An unexpected error occurred. Please try again.",
          });
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      }
    },
    (validationErrors) => {
      // Let React Hook Form handle field validation errors automatically
      // Only show a general toast for user feedback
      console.log("Form validation errors:", validationErrors);

      toast({
        title: "Validation Errors",
        description: "Please check the highlighted fields and fix any errors.",
        variant: "destructive",
      });
    }
  );

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[100vh] flex flex-col gap-0 w-full max-w-none border-none p-0"
      >
        <SheetHeader className="absolute top-0 left-0 right-0 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left text-xl font-semibold">
                {mode === "edit" ? "Edit Product" : "Create Product"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {mode === "edit" 
                  ? "Update product information and manage variants"
                  : "Add new products and manage variants"
                }
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex max-h-full pt-20">
          <div className="flex w-full justify-center max-h-full overflow-y-auto">
            {/* Main Content */}
            <div className="flex flex-col w-full max-w-3xl p-3 md:p-8 space-y-14">
              {/* Product Information */}
              <ProductInformationSection
                register={register}
                control={control}
                errors={errors}
                hasVariants={hasVariants}
                onHasVariantsChange={handleHasVariantsChange}
              />

              {/* Sub-Descriptions */}
              <SubDescriptionsSection
                subDescriptions={subDescriptions}
                onAddSubDescription={addSubDescription}
                onRemoveSubDescription={removeSubDescription}
                onUpdateSubDescription={updateSubDescription}
                errors={errors}
              />

              {/* Product Images */}
              <ProductImagesSection
                images={images}
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileInputChange={handleFileInputChange}
                onSetThumbnail={setThumbnail}
                onRemoveImage={removeImage}
                errors={errors}
              />

              {/* Product Variants - Only show when hasVariants is true */}
              {hasVariants && (
                <ProductVariantsSection
                  variants={variants}
                  selectedAttributes={selectedAttributes}
                  open={open}
                  onOpenChange={setOpen}
                  onAddVariant={addVariant}
                  onRemoveVariant={removeVariant}
                  onAttributeSelect={handleAttributeSelect}
                  onUpdateVariantAttribute={updateVariantAttribute}
                  onUpdateVariantField={updateVariantField}
                  errors={errors}
                />
              )}

              <SEOSection
                metaTitle={watchedValues.metaTitle || ""}
                metaDescription={watchedValues.metaDescription || ""}
                keywords={watchedValues.keywords || ""}
                onMetaTitleChange={(value) => setValue("metaTitle", value)}
                onMetaDescriptionChange={(value) =>
                  setValue("metaDescription", value)
                }
                onKeywordsChange={(value) => setValue("keywords", value)}
              />

              <section className="border border-transparent"></section>
            </div>
          </div>
          {/* Sidebar */}
          <div className="hidden w-full max-w-[400px] lg:flex flex-col justify-between bg-muted p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-sm">Preview</h3>
              <Card>
                <CardContent className="p-3">
                  <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium truncate text-sm">
                    {watchedValues.productName || "Product Name"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {watchedValues.brand || "Brand"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-sm">
                      Rp
                      {hasVariants
                        ? watchedValues.variants?.[0]?.price || "-"
                        : watchedValues.simplePrice || "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2 pt-4 border-t">
              {/* Display field validation errors */}
              {Object.keys(errors).length > 0 && !errors.root && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the validation errors in the highlighted fields.
                  </AlertDescription>
                </Alert>
              )}

              {/* Display root-level errors (server errors, upload failures, etc.) */}
              {errors.root && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {Object.values(errors.root).map((error, index) => (
                      <div key={index}>
                        {typeof error === "string"
                          ? error
                          : typeof error === "object" &&
                            error &&
                            "message" in error
                          ? error.message
                          : "An error occurred"}
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSave}
                className="w-full h-9"
                disabled={isSubmitting || createProductMutation.isPending || updateProductMutation.isPending}
              >
                {isSubmitting || createProductMutation.isPending || updateProductMutation.isPending
                  ? (mode === "edit" ? "Updating..." : "Creating...")
                  : (mode === "edit" ? "Update Product" : "Create Product")}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-9"
                disabled={isSubmitting || createProductMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
