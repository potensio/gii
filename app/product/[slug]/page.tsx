import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGallery } from "@/components/product-gallery"
import { ProductDetails } from "@/components/product-details"
import { ProductDescription } from "@/components/product-description"
import { ProductSpecifications } from "@/components/product-specifications"
import { RelatedProductsSection } from "@/components/related-products-section"
import { JoinClubSidebar } from "@/components/join-club-sidebar"

// Define a type for product data
interface Product {
  id: string
  slug: string
  brand: string
  title: string
  price: string
  afterpayPrice: string
  images: { src: string; alt: string }[]
  colors: { name: string; hex: string; imageSrc: string }[]
  sizes: string[]
  stock: number
  description: string
  fabricFit: string
  careInstructions: string
  specifications: { iconSrc: string; iconAlt: string; label: string; value: string }[]
}

// Hardcoded product data for demonstration
const productData: Product = {
  id: "1",
  slug: "stay-humble-relax-crew-midnight-cobalt",
  brand: "Flowers & Saints",
  title: "Stay Humble Relax Crew - Midnight Cobalt",
  price: "$79.00",
  afterpayPrice: "$19.75",
  images: [
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "Stay Humble Relax Crew - Midnight Cobalt, front view",
    },
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "Stay Humble Relax Crew - Midnight Cobalt, back view",
    },
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "Stay Humble Relax Crew - Midnight Cobalt, detail view",
    },
  ],
  colors: [
    { name: "Covenant Clay", hex: "#A0522D", imageSrc: "/placeholder.svg?height=64&width=64" },
    { name: "Faded Halo", hex: "#808080", imageSrc: "/placeholder.svg?height=64&width=64" },
    { name: "Midnight Cobalt", hex: "#191970", imageSrc: "/placeholder.svg?height=64&width=64" },
    { name: "Sacred Shadow", hex: "#36454F", imageSrc: "/placeholder.svg?height=64&width=64" },
    { name: "Sacred Sand", hex: "#E0D8C7", imageSrc: "/placeholder.svg?height=64&width=64" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  stock: 5, // Example stock level
  description: `Rooted. Quietly Powerful. Unshakably Grounded.
  For the ones who let action speak louder than ego — the Stay Humble Relax Hood is a wearable mindset. It's a reminder that strength isn't about noise, it's about presence.
  Oversized "Stay Humble" typography anchors the back, balanced with subtle details that whisper clarity — not chaos. Crafted from 320GSM brushed fleece with a premium cotton-recycled blend, this hoodie wraps you in weight and warmth without ever weighing you down. Pre-shrunk, drop-shouldered, and finished with a kangaroo pocket and self-lined hood — every inch designed for movement with meaning.
  This isn't just streetwear. It's street wisdom.
  Because:
  You don't need to be loud to be heard.
  Staying humble is your loudest flex.`,
  fabricFit: `Our Relax Crew is designed for a comfortable, relaxed fit. It features a dropped shoulder and a slightly oversized silhouette, perfect for layering or a casual look. Made from 320GSM brushed fleece, it offers warmth without bulk.`,
  careInstructions: `Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed. Do not dry clean.`,
  specifications: [
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Relaxed Fit Icon",
      label: "Relaxed Fit",
      value: "",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "320 GSM Icon",
      label: "320 GSM",
      value: "",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Premium Print Icon",
      label: "Premium Print",
      value: "",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Preshrunk Icon",
      label: "Preshrunk to",
      value: "Minimize Shrinkage",
    },
  ],
}

// Hardcoded related products data
const relatedProducts = [
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Sacred Sand",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Sacred Sand",
    price: "$79.00",
    slug: "stay-humble-relax-crew-sacred-sand",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Faded Halo",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Faded Halo",
    price: "$79.00",
    slug: "stay-humble-relax-crew-faded-halo",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Sacred Shadow",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Sacred Shadow",
    price: "$79.00",
    slug: "stay-humble-relax-crew-sacred-shadow",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Midnight Cobalt",
    price: "$79.00",
    slug: "stay-humble-relax-crew-midnight-cobalt",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Hood - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Hood - Midnight Cobalt",
    price: "$89.00",
    slug: "stay-humble-relax-hood-midnight-cobalt",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Covenant Clay",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Covenant Clay",
    price: "$79.00",
    slug: "stay-humble-relax-crew-covenant-clay",
  },
]

export default function ProductPage({ params }: { params: { slug: string } }) {
  // In a real application, you would fetch product data based on params.slug
  // For this example, we're using hardcoded data.
  const product = productData

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 p-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Product Gallery */}
            <ProductGallery images={product.images} />

            {/* Product Details */}
            <ProductDetails
              brand={product.brand}
              title={product.title}
              price={product.price}
              afterpayPrice={product.afterpayPrice}
              colors={product.colors}
              sizes={product.sizes}
              stock={product.stock}
            />
          </div>

          {/* Description and Specifications */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
            <ProductDescription
              description={product.description}
              fabricFit={product.fabricFit}
              careInstructions={product.careInstructions}
            />
            <ProductSpecifications specifications={product.specifications} />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProductsSection products={relatedProducts} />
      </main>
      <SiteFooter />
      <JoinClubSidebar />
    </div>
  )
}
