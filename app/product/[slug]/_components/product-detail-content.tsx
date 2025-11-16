"use client";

import { useState, useEffect } from "react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetails } from "@/components/product-details";
import { ProductDescription } from "@/components/product-description";
import { CartDrawer } from "@/components/cart-drawer";
import { useAddToCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import type {
  SelectProductGroup,
  SelectProductVariant,
  SelectProduct,
} from "@/lib/db/schema";

interface CompleteProduct {
  productGroup: SelectProductGroup & {
    images?: Array<{ url: string; isThumbnail: boolean }>;
    additionalDescriptions?: Array<{ title: string; body: string }>;
  };
  variants: SelectProductVariant[];
  products: SelectProduct[];
  variantSelectionsByProductId: Record<string, Record<string, string>>;
}

interface ProductDetailContentProps {
  productData: CompleteProduct;
}

interface VariantOption {
  type: string;
  value: string;
  available: boolean;
}

export function ProductDetailContent({
  productData,
}: ProductDetailContentProps) {
  const { productGroup, variants, products } = productData;

  // Cart mutation hook
  const addToCartMutation = useAddToCart();

  // State management
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<SelectProduct | null>(
    null
  );
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Initialize selected variants with first available option for each variant type
  useEffect(() => {
    const variantGroups = getVariantGroups();
    const initialVariants: Record<string, string> = {};

    variantGroups.forEach((group) => {
      const firstAvailable = group.options.find((opt) => opt.available);
      if (firstAvailable) {
        initialVariants[group.type] = firstAvailable.value;
      }
    });

    setSelectedVariants(initialVariants);
  }, []);

  // Update selected product when variants change (using random selection for now)
  useEffect(() => {
    if (Object.keys(selectedVariants).length > 0) {
      selectRandomProduct();
    }
  }, [selectedVariants]);

  // Handler functions
  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantType]: value,
    }));
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is at least 1
    const validQuantity = Math.max(1, newQuantity);

    // Validate quantity against stock
    if (selectedProduct && validQuantity > selectedProduct.stock) {
      toast.warning("Jumlah melebihi stok tersedia", {
        description: `Stok tersedia: ${selectedProduct.stock}`,
      });
      setQuantity(selectedProduct.stock);
      return;
    }
    setQuantity(validQuantity);
  };

  const handleAddToCart = () => {
    // Validation: Check if product is selected
    if (!selectedProduct) {
      toast.error("Silakan pilih varian produk");
      return;
    }

    // Validation: Check if all required variants are selected
    const variantGroups = getVariantGroups();
    const allVariantsSelected = variantGroups.every(
      (group) => selectedVariants[group.type]
    );

    if (!allVariantsSelected) {
      toast.error("Silakan pilih semua varian produk");
      return;
    }

    // Validation: Check if product is in stock
    if (selectedProduct.stock === 0) {
      toast.error("Produk tidak tersedia");
      return;
    }

    // Validation: Check quantity against stock
    if (quantity > selectedProduct.stock) {
      toast.error("Jumlah melebihi stok tersedia", {
        description: `Stok tersedia: ${selectedProduct.stock}`,
      });
      return;
    }

    // Extract thumbnail from product group images
    const thumbnailUrl =
      productGroup.images?.find((img) => img.isThumbnail)?.url ||
      productGroup.images?.[0]?.url ||
      null;

    // Add item to cart
    addToCartMutation.mutate({
      product: {
        productId: selectedProduct.id,
        productGroupId: productGroup.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        thumbnailUrl,
        variantSelections: selectedVariants,
      },
      quantity,
    });

    // Show success toast with action to view cart
    toast.success("Produk berhasil ditambahkan ke keranjang", {
      description: `${selectedProduct.name} (${quantity}x)`,
      action: {
        label: "Lihat Keranjang",
        onClick: () => setIsCartDrawerOpen(true),
      },
    });
  };

  // Select random product from available products (simplified approach)
  const selectRandomProduct = () => {
    const availableProducts = products.filter(
      (p) => p.isActive && !p.isDeleted && p.stock > 0
    );

    if (availableProducts.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      setSelectedProduct(availableProducts[randomIndex]);
    } else {
      // If no products with stock, select first available product
      const firstAvailable = products.find((p) => p.isActive && !p.isDeleted);
      setSelectedProduct(firstAvailable || null);
    }
  };

  // Get variant groups structured for ProductDetails component
  const getVariantGroups = (): Array<{
    type: string;
    options: VariantOption[];
  }> => {
    // Group variants by type
    const variantsByType = variants.reduce(
      (acc, variant) => {
        if (!variant.isActive || variant.isDeleted) return acc;

        if (!acc[variant.variant]) {
          acc[variant.variant] = [];
        }
        acc[variant.variant].push(variant);
        return acc;
      },
      {} as Record<string, SelectProductVariant[]>
    );

    // Convert to array format with availability info
    return Object.entries(variantsByType).map(([type, variantList]) => ({
      type,
      options: variantList.map((variant) => ({
        type: variant.variant,
        value: variant.value,
        available: true, // For now, mark all as available (simplified approach)
      })),
    }));
  };

  // Prepare images for ProductGallery
  const galleryImages =
    productGroup.images?.map((img, index) => ({
      src: img.url,
      alt: `${productGroup.name} - Image ${index + 1}`,
    })) || [];

  // If no images, provide placeholder
  if (galleryImages.length === 0) {
    galleryImages.push({
      src: "/placeholder.svg",
      alt: productGroup.name,
    });
  }

  const variantGroups = getVariantGroups();

  return (
    <>
      <div className="grid gap-6 md:gap-10 lg:gap-20 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery
          images={galleryImages}
          selectedIndex={selectedImageIndex}
          onImageSelect={handleImageSelect}
        />

        {/* Product Details */}
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          <ProductDetails
            brand={productGroup.brand}
            title={productGroup.name}
            description={productGroup.description || undefined}
            selectedProduct={selectedProduct}
            variantGroups={variantGroups}
            selectedVariants={selectedVariants}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />

          {/* Product Description */}
          <ProductDescription
            description={
              productGroup.description || "No description available."
            }
            additionalDescriptions={productGroup.additionalDescriptions}
          />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen} />
    </>
  );
}
