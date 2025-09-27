import {
  Prisma,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Brand,
  VariantAttribute,
  ProductStatus,
  VariantAttributeType,
} from "../generated/prisma/client";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductPaginationOptions,
  CreateVariantInput,
  UpdateVariantInput,
  CreateVariantAttributeInput,
  UpdateVariantAttributeInput,
  CreateProductImageInput,
  UpdateProductImageInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateBrandInput,
  UpdateBrandInput,
} from "../schemas/product.schema";
import { db } from "../db";

export class ProductRepository {
  // Product CRUD operations
  async create(data: CreateProductInput): Promise<Product> {
    return db.product.create({
      data,
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
    });
  }

  async findMany(
    filters: ProductFilters = {},
    pagination: ProductPaginationOptions
  ): Promise<{ products: Product[]; total: number }> {
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const {
      status,
      brandId,
      categoryId,
      featured,
      search,
      minPrice,
      maxPrice,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      ...(brandId && { brandId }),
      ...(categoryId && { categoryId }),
      ...(featured !== undefined && { featured }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
      ...(minPrice !== undefined &&
        maxPrice !== undefined && {
          basePrice: { gte: minPrice, lte: maxPrice },
        }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { brand: { name: { contains: search, mode: "insensitive" } } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          brand: true,
          category: true,
          variants: {
            include: {
              attributes: true,
              images: true,
            },
          },
          images: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return { products, total };
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return db.product.update({
      where: { id },
      data,
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return db.product.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return db.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return db.product.findMany({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
      },
      take: limit,
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductsByCategory(
    categoryId: string,
    limit?: number
  ): Promise<Product[]> {
    return db.product.findMany({
      where: {
        categoryId,
        status: ProductStatus.ACTIVE,
      },
      ...(limit && { take: limit }),
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductsByBrand(
    brandId: string,
    limit?: number
  ): Promise<Product[]> {
    return db.product.findMany({
      where: {
        brandId,
        status: ProductStatus.ACTIVE,
      },
      ...(limit && { take: limit }),
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            attributes: true,
            images: true,
          },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
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
    const [total, active, inactive, featured, categories, brands] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { status: ProductStatus.ACTIVE } }),
        db.product.count({ where: { status: ProductStatus.INACTIVE } }),
        db.product.count({ where: { isFeatured: true } }),
        db.product.groupBy({
          by: ["categoryId"],
          _count: { _all: true },
        }),
        db.product.groupBy({
          by: ["brandId"],
          _count: { _all: true },
        }),
      ]);

    const byCategory: Record<string, number> = {};
    categories.forEach((cat) => {
      if (cat.categoryId) {
        byCategory[cat.categoryId] = cat._count._all;
      }
    });

    const byBrand: Record<string, number> = {};
    brands.forEach((brand) => {
      if (brand.brandId) {
        byBrand[brand.brandId] = brand._count._all;
      }
    });

    return {
      total,
      active,
      inactive,
      discontinued: 0, // Not available in current schema
      outOfStock: 0, // Not available in current schema
      featured,
      byCategory,
      byBrand,
    };
  }

  // Product Variant operations
  async createVariant(data: CreateVariantInput): Promise<ProductVariant> {
    return db.productVariant.create({
      data,
      include: {
        product: true,
        attributes: true,
        images: true,
      },
    });
  }

  async findVariantById(id: string): Promise<ProductVariant | null> {
    return db.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        attributes: true,
        images: true,
      },
    });
  }

  async findVariantsBySku(sku: string): Promise<ProductVariant[]> {
    return db.productVariant.findMany({
      where: { sku: { contains: sku, mode: "insensitive" } },
      include: {
        product: true,
        attributes: true,
        images: true,
      },
    });
  }

  async updateVariant(
    id: string,
    data: UpdateVariantInput
  ): Promise<ProductVariant> {
    return db.productVariant.update({
      where: { id },
      data,
      include: {
        product: true,
        attributes: true,
        images: true,
      },
    });
  }

  async deleteVariant(id: string): Promise<ProductVariant> {
    return db.productVariant.delete({
      where: { id },
    });
  }

  async getLowStockVariants(threshold?: number): Promise<ProductVariant[]> {
    return db.productVariant.findMany({
      where: {
        trackInventory: true,
        stock: {
          lte: threshold || db.productVariant.fields.lowStockThreshold,
        },
      },
      include: {
        product: true,
        attributes: true,
        images: true,
      },
      orderBy: { stock: "asc" },
    });
  }

  // Variant Attribute operations
  async createVariantAttribute(
    data: CreateVariantAttributeInput
  ): Promise<VariantAttribute> {
    return db.variantAttribute.create({
      data,
      include: {
        variant: true,
      },
    });
  }

  async updateVariantAttribute(
    id: string,
    data: UpdateVariantAttributeInput
  ): Promise<VariantAttribute> {
    return db.variantAttribute.update({
      where: { id },
      data,
      include: {
        variant: true,
      },
    });
  }

  async deleteVariantAttribute(id: string): Promise<VariantAttribute> {
    return db.variantAttribute.delete({
      where: { id },
    });
  }

  // Product Image operations
  async createProductImage(
    data: CreateProductImageInput
  ): Promise<ProductImage> {
    return db.productImage.create({
      data,
      include: {
        product: true,
        variant: true,
      },
    });
  }

  async updateProductImage(
    id: string,
    data: UpdateProductImageInput
  ): Promise<ProductImage> {
    return db.productImage.update({
      where: { id },
      data,
      include: {
        product: true,
        variant: true,
      },
    });
  }

  async deleteProductImage(id: string): Promise<ProductImage> {
    return db.productImage.delete({
      where: { id },
    });
  }

  // Category operations
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return db.category.create({
      data,
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });
  }

  async findAllCategories(): Promise<Category[]> {
    return db.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    return db.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });
  }

  async deleteCategory(id: string): Promise<Category> {
    return db.category.delete({
      where: { id },
    });
  }

  // Brand operations
  async createBrand(data: CreateBrandInput): Promise<Brand> {
    return db.brand.create({
      data,
      include: {
        products: true,
      },
    });
  }

  async findBrandById(id: string): Promise<Brand | null> {
    return db.brand.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  async findBrandBySlug(slug: string): Promise<Brand | null> {
    return db.brand.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });
  }

  async findAllBrands(): Promise<Brand[]> {
    return db.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async updateBrand(id: string, data: UpdateBrandInput): Promise<Brand> {
    return db.brand.update({
      where: { id },
      data,
      include: {
        products: true,
      },
    });
  }

  async deleteBrand(id: string): Promise<Brand> {
    return db.brand.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
