import Image from "next/image"
import Link from "next/link" // Import Link
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  color?: string // Hex color string for the swatch
  className?: string
  slug: string // Add slug prop for linking
}

export function ProductCard({ imageSrc, imageAlt, brand, title, price, color, className, slug }: ProductCardProps) {
  return (
    <Link href={`/product/${slug}`} className="block">
      {" "}
      {/* Wrap with Link */}
      <Card className={cn("w-64 flex-shrink-0 overflow-hidden rounded-xl shadow-sm", className)}>
        <div className="relative h-64 w-full">
          <Image
            src={imageSrc || "/placeholder.svg?height=256&width=256&query=product image"}
            alt={imageAlt}
            fill
            className="rounded-t-xl object-cover"
          />
        </div>
        <CardContent className="p-4">
          <p className="mb-1 text-xs uppercase text-gray-500">{brand}</p>
          <div className="flex items-start justify-between">
            <h3 className="text-base font-medium leading-tight">{title}</h3>
            <p className="ml-4 text-sm font-semibold">{price}</p>
          </div>
          {color && (
            <div className="mt-2 flex items-center space-x-2">
              <div
                className="size-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                aria-label={`Color: ${color}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
