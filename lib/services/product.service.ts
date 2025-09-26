import {
  Product,
  ProductVariant,
  ProductImage,
  ProductSpecification,
  Category,
  Brand,
  VariantAttribute,
  ProductStatus,
} from "../generated/prisma/client";
import { productRepository } from "../repositories/product.repository";
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  productPaginationSchema,
  createVariantSchema,
  updateVariantSchema,
  createVariantAttributeSchema,
  updateVariantAttributeSchema,
  createProductImageSchema,
  updateProductImageSchema,
  createProductSpecificationSchema,
  updateProductSpecificationSchema,
  createCategorySchema,
  updateCategorySchema,
  createBrandSchema,
  updateBrandSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilters,
  type ProductPaginationOptions,
  type CreateVariantInput,
  type UpdateVariantInput,
  type CreateVariantAttributeInput,
  type UpdateVariantAttributeInput,
  type CreateProductImageInput,
  type UpdateProductImageInput,
  type CreateProductSpecificationInput,
  type UpdateProductSpecificationInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CreateBrandInput,
  type UpdateBrandInput,
} from "../schemas/product.schema";

export class ProductService {
  // Product operations
  async createProduct(input: CreateProductInput): Promise<Product> {
    const validatedInput = createProductSchema.parse(input);

    // Check if product with same slug already exists
    const existingProduct = await productRepository.findBySlug(
      validatedInput.slug
    );
    if (existingProduct) {
      throw new Error(`Product with slug "${validatedInput.slug}" already exists`);
    }

    // Verify brand exists
    const brand = await this.getBrandById(validatedInput.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Verify category exists
    const category = await this.getCategoryById(validatedInput.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Extract imageUrls and remove it from the product data
    const { imageUrls, ...productData } = validatedInput;

    // Create the product
    const createdProduct = await productRepository.create(productData);

    // Handle image creation if imageUrls are provided
    if (imageUrls && imageUrls.length > 0) {
      const imagePromises = imageUrls.map((url, index) => {
        const imageInput: CreateProductImageInput = {
          productId: createdProduct.id,
          url,
          altText: `${createdProduct.name} - Image ${index + 1}`,
          sortOrder: index,
          isMain: index === 0, // First image is the main image
        };
        return this.createProductImage(imageInput);
      });

      await Promise.all(imagePromises);
    }

    // Return the product with images included
    const productWithImages = await productRepository.findById(
      createdProduct.id
    );
    if (!productWithImages) {
      throw new Error("Failed to retrieve created product");
    }
    return productWithImages;
  }

  async getProductById(id: string): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    if (!slug) {
      throw new Error("Product slug is required");
    }

    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getProducts(
    filters: ProductFilters = {},
    pagination: ProductPaginationOptions
  ): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    // Validate inputs
    const validatedFilters = productFiltersSchema.parse(filters);
    const validatedPagination = productPaginationSchema.parse(pagination);

    const result = await productRepository.findMany(
      validatedFilters,
      validatedPagination
    );

    return {
      ...result,
      totalPages: Math.ceil(result.total / validatedPagination.limit),
      currentPage: validatedPagination.page,
    };
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    // Validate input
    const validatedInput = updateProductSchema.parse(input);

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // If slug is being updated, check for conflicts
    if (validatedInput.slug && validatedInput.slug !== existingProduct.slug) {
      const slugConflict = await productRepository.findBySlug(
        validatedInput.slug
      );
      if (slugConflict) {
        throw new Error("Slug is already in use by another product");
      }
    }

    // Verify brand exists if being updated
    if (validatedInput.brandId) {
      const brand = await productRepository.findBrandById(
        validatedInput.brandId
      );
      if (!brand) {
        throw new Error("Brand not found");
      }
    }

    // Verify category exists if being updated
    if (validatedInput.categoryId) {
      const category = await productRepository.findCategoryById(
        validatedInput.categoryId
      );
      if (!category) {
        throw new Error("Category not found");
      }
    }

    return productRepository.update(id, validatedInput);
  }

  async deleteProduct(id: string): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    return productRepository.delete(id);
  }

  async deleteProducts(ids: string[]): Promise<{ count: number }> {
    if (!ids || ids.length === 0) {
      throw new Error("Product IDs are required");
    }

    return productRepository.deleteMany(ids);
  }

  async updateProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    return productRepository.update(id, { status });
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return productRepository.getFeaturedProducts(limit);
  }

  async getProductsByCategory(
    categoryId: string,
    limit?: number
  ): Promise<Product[]> {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const category = await productRepository.findCategoryById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    return productRepository.getProductsByCategory(categoryId, limit);
  }

  async getProductsByBrand(
    brandId: string,
    limit?: number
  ): Promise<Product[]> {
    if (!brandId) {
      throw new Error("Brand ID is required");
    }

    const brand = await productRepository.findBrandById(brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    return productRepository.getProductsByBrand(brandId, limit);
  }

  async getProductStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    discontinued: number;
    outOfStock: number;
    featured: number;
    byCategory: Record<string, number>;
    byBrand: Record<string, number>;
  }> {
    return productRepository.getProductStats();
  }

  // Product Variant operations
  async createVariant(input: CreateVariantInput): Promise<ProductVariant> {
    // Validate input
    const validatedInput = createVariantSchema.parse(input);

    // Check if product exists
    const product = await productRepository.findById(validatedInput.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if variant with slug already exists
    const existingVariant = await productRepository.findVariantBySlug(
      validatedInput.slug
    );
    if (existingVariant) {
      throw new Error("Variant with this slug already exists");
    }

    // Check if SKU already exists
    const existingSkuVariants = await productRepository.findVariantsBySku(
      validatedInput.sku
    );
    if (existingSkuVariants.length > 0) {
      throw new Error("Variant with this SKU already exists");
    }

    return productRepository.createVariant(validatedInput);
  }

  async getVariantById(id: string): Promise<ProductVariant> {
    if (!id) {
      throw new Error("Variant ID is required");
    }

    const variant = await productRepository.findVariantById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }

    return variant;
  }

  async getVariantBySlug(slug: string): Promise<ProductVariant> {
    if (!slug) {
      throw new Error("Variant slug is required");
    }

    const variant = await productRepository.findVariantBySlug(slug);
    if (!variant) {
      throw new Error("Variant not found");
    }

    return variant;
  }

  async updateVariant(
    id: string,
    input: UpdateVariantInput
  ): Promise<ProductVariant> {
    if (!id) {
      throw new Error("Variant ID is required");
    }

    // Validate input
    const validatedInput = updateVariantSchema.parse(input);

    // Check if variant exists
    const existingVariant = await productRepository.findVariantById(id);
    if (!existingVariant) {
      throw new Error("Variant not found");
    }

    // If slug is being updated, check for conflicts
    if (validatedInput.slug && validatedInput.slug !== existingVariant.slug) {
      const slugConflict = await productRepository.findVariantBySlug(
        validatedInput.slug
      );
      if (slugConflict) {
        throw new Error("Slug is already in use by another variant");
      }
    }

    // If SKU is being updated, check for conflicts
    if (validatedInput.sku && validatedInput.sku !== existingVariant.sku) {
      const skuConflicts = await productRepository.findVariantsBySku(
        validatedInput.sku
      );
      if (skuConflicts.length > 0) {
        throw new Error("SKU is already in use by another variant");
      }
    }

    return productRepository.updateVariant(id, validatedInput);
  }

  async deleteVariant(id: string): Promise<ProductVariant> {
    if (!id) {
      throw new Error("Variant ID is required");
    }

    const existingVariant = await productRepository.findVariantById(id);
    if (!existingVariant) {
      throw new Error("Variant not found");
    }

    return productRepository.deleteVariant(id);
  }

  async getLowStockVariants(threshold?: number): Promise<ProductVariant[]> {
    return productRepository.getLowStockVariants(threshold);
  }

  // Variant Attribute operations
  async createVariantAttribute(
    input: CreateVariantAttributeInput
  ): Promise<VariantAttribute> {
    // Validate input
    const validatedInput = createVariantAttributeSchema.parse(input);

    // Check if variant exists
    const variant = await productRepository.findVariantById(
      validatedInput.variantId
    );
    if (!variant) {
      throw new Error("Variant not found");
    }

    return productRepository.createVariantAttribute(validatedInput);
  }

  async updateVariantAttribute(
    id: string,
    input: UpdateVariantAttributeInput
  ): Promise<VariantAttribute> {
    if (!id) {
      throw new Error("Variant attribute ID is required");
    }

    // Validate input
    const validatedInput = updateVariantAttributeSchema.parse(input);

    return productRepository.updateVariantAttribute(id, validatedInput);
  }

  async deleteVariantAttribute(id: string): Promise<VariantAttribute> {
    if (!id) {
      throw new Error("Variant attribute ID is required");
    }

    return productRepository.deleteVariantAttribute(id);
  }

  // Product Image operations
  async createProductImage(
    input: CreateProductImageInput
  ): Promise<ProductImage> {
    // Validate input
    const validatedInput = createProductImageSchema.parse(input);

    // Check if product or variant exists
    if (validatedInput.productId) {
      const product = await productRepository.findById(
        validatedInput.productId
      );
      if (!product) {
        throw new Error("Product not found");
      }
    }

    if (validatedInput.variantId) {
      const variant = await productRepository.findVariantById(
        validatedInput.variantId
      );
      if (!variant) {
        throw new Error("Variant not found");
      }
    }

    return productRepository.createProductImage(validatedInput);
  }

  async updateProductImage(
    id: string,
    input: UpdateProductImageInput
  ): Promise<ProductImage> {
    if (!id) {
      throw new Error("Product image ID is required");
    }

    // Validate input
    const validatedInput = updateProductImageSchema.parse(input);

    return productRepository.updateProductImage(id, validatedInput);
  }

  async deleteProductImage(id: string): Promise<ProductImage> {
    if (!id) {
      throw new Error("Product image ID is required");
    }

    return productRepository.deleteProductImage(id);
  }

  // Product Specification operations
  async createProductSpecification(
    input: CreateProductSpecificationInput
  ): Promise<ProductSpecification> {
    // Validate input
    const validatedInput = createProductSpecificationSchema.parse(input);

    // Check if product exists
    const product = await productRepository.findById(validatedInput.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    return productRepository.createProductSpecification(validatedInput);
  }

  async updateProductSpecification(
    id: string,
    input: UpdateProductSpecificationInput
  ): Promise<ProductSpecification> {
    if (!id) {
      throw new Error("Product specification ID is required");
    }

    // Validate input
    const validatedInput = updateProductSpecificationSchema.parse(input);

    return productRepository.updateProductSpecification(id, validatedInput);
  }

  async deleteProductSpecification(id: string): Promise<ProductSpecification> {
    if (!id) {
      throw new Error("Product specification ID is required");
    }

    return productRepository.deleteProductSpecification(id);
  }

  // Category operations
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    // Validate input
    const validatedInput = createCategorySchema.parse(input);

    // Check if category with slug already exists
    const existingCategory = await productRepository.findCategoryBySlug(
      validatedInput.slug
    );
    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }

    // Check if parent category exists
    if (validatedInput.parentId) {
      const parentCategory = await productRepository.findCategoryById(
        validatedInput.parentId
      );
      if (!parentCategory) {
        throw new Error("Parent category not found");
      }
    }

    return productRepository.createCategory(validatedInput);
  }

  async getCategoryById(id: string): Promise<Category> {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const category = await productRepository.findCategoryById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    if (!slug) {
      throw new Error("Category slug is required");
    }

    const category = await productRepository.findCategoryBySlug(slug);
    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return productRepository.findAllCategories();
  }

  async updateCategory(
    id: string,
    input: UpdateCategoryInput
  ): Promise<Category> {
    if (!id) {
      throw new Error("Category ID is required");
    }

    // Validate input
    const validatedInput = updateCategorySchema.parse(input);

    // Check if category exists
    const existingCategory = await productRepository.findCategoryById(id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // If slug is being updated, check for conflicts
    if (validatedInput.slug && validatedInput.slug !== existingCategory.slug) {
      const slugConflict = await productRepository.findCategoryBySlug(
        validatedInput.slug
      );
      if (slugConflict) {
        throw new Error("Slug is already in use by another category");
      }
    }

    // Check if parent category exists
    if (validatedInput.parentId) {
      const parentCategory = await productRepository.findCategoryById(
        validatedInput.parentId
      );
      if (!parentCategory) {
        throw new Error("Parent category not found");
      }

      // Prevent circular references
      if (validatedInput.parentId === id) {
        throw new Error("Category cannot be its own parent");
      }
    }

    return productRepository.updateCategory(id, validatedInput);
  }

  async deleteCategory(id: string): Promise<Category> {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const existingCategory = await productRepository.findCategoryById(id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Check if category has products
    const productsInCategory = await productRepository.getProductsByCategory(
      id,
      1
    );
    if (productsInCategory.length > 0) {
      throw new Error("Cannot delete category that contains products");
    }

    return productRepository.deleteCategory(id);
  }

  // Brand operations
  async createBrand(input: CreateBrandInput): Promise<Brand> {
    // Validate input
    const validatedInput = createBrandSchema.parse(input);

    // Check if brand with slug already exists
    const existingBrand = await productRepository.findBrandBySlug(
      validatedInput.slug
    );
    if (existingBrand) {
      throw new Error("Brand with this slug already exists");
    }

    return productRepository.createBrand(validatedInput);
  }

  async getBrandById(id: string): Promise<Brand> {
    if (!id) {
      throw new Error("Brand ID is required");
    }

    const brand = await productRepository.findBrandById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  async getBrandBySlug(slug: string): Promise<Brand> {
    if (!slug) {
      throw new Error("Brand slug is required");
    }

    const brand = await productRepository.findBrandBySlug(slug);
    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  async getAllBrands(): Promise<Brand[]> {
    return productRepository.findAllBrands();
  }

  async updateBrand(id: string, input: UpdateBrandInput): Promise<Brand> {
    if (!id) {
      throw new Error("Brand ID is required");
    }

    // Validate input
    const validatedInput = updateBrandSchema.parse(input);

    // Check if brand exists
    const existingBrand = await productRepository.findBrandById(id);
    if (!existingBrand) {
      throw new Error("Brand not found");
    }

    // If slug is being updated, check for conflicts
    if (validatedInput.slug && validatedInput.slug !== existingBrand.slug) {
      const slugConflict = await productRepository.findBrandBySlug(
        validatedInput.slug
      );
      if (slugConflict) {
        throw new Error("Slug is already in use by another brand");
      }
    }

    return productRepository.updateBrand(id, validatedInput);
  }

  async deleteBrand(id: string): Promise<Brand> {
    if (!id) {
      throw new Error("Brand ID is required");
    }

    const existingBrand = await productRepository.findBrandById(id);
    if (!existingBrand) {
      throw new Error("Brand not found");
    }

    // Check if brand has products
    const productsInBrand = await productRepository.getProductsByBrand(id, 1);
    if (productsInBrand.length > 0) {
      throw new Error("Cannot delete brand that has products");
    }

    return productRepository.deleteBrand(id);
  }
}

export const productService = new ProductService();