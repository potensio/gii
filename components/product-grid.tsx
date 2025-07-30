import { ProductCard } from "./product-card"

interface Product {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  color?: string
  slug: string
  category: string
  size: string[]
  inStock: boolean
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          imageSrc={product.imageSrc}
          imageAlt={product.imageAlt}
          brand={product.brand}
          title={product.title}
          price={product.price}
          color={product.color}
          slug={product.slug}
        />
      ))}
    </div>
  )
}
