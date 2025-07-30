import Image from "next/image"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface BundleProduct {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  colorOptions?: { value: string; label: string; hex: string }[]
  sizeOptions?: { value: string; label: string }[]
  volumeOptions?: { value: string; label: string }[]
  materialOptions?: { value: string; label: string }[]
}

interface BundleShowcaseSectionProps {
  backgroundImageSrc: string
  backgroundImageAlt: string
  title: string
  teaser: string
  description: string
  products: BundleProduct[]
  buttonText: string
  reverseLayout?: boolean // For alternating layout
}

export function BundleShowcaseSection({
  backgroundImageSrc,
  backgroundImageAlt,
  title,
  teaser,
  description,
  products,
  buttonText,
  reverseLayout = false,
}: BundleShowcaseSectionProps) {
  return (
    <section className="relative h-[800px] w-full overflow-hidden md:h-[900px]">
      <Image
        src={backgroundImageSrc || "/placeholder.svg"}
        alt={backgroundImageAlt}
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      {/* Dark overlay for text readability */}
      <div
        className={cn(
          "relative z-10 grid h-full items-center gap-8 p-8 md:grid-cols-2 md:p-16",
          reverseLayout ? "md:grid-cols-[1fr_0.8fr]" : "md:grid-cols-[0.8fr_1fr]",
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-center space-y-6 text-white",
            reverseLayout ? "md:order-2" : "md:order-1",
          )}
        >
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">{title}</h2>
          <p className="text-lg font-semibold">{teaser}</p>
          <p className="text-base leading-relaxed text-gray-200">{description}</p>
        </div>
        <div
          className={cn(
            "flex flex-col items-center justify-center space-y-4",
            reverseLayout ? "md:order-1" : "md:order-2",
          )}
        >
          {products.map((product, index) => (
            <Card key={index} className="w-full max-w-sm rounded-xl bg-white/90 p-4 shadow-lg">
              <CardHeader className="p-0 pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase text-gray-500">{product.brand}</p>
                  {index > 0 && <Plus className="size-4 text-gray-500" />}
                  {/* Plus icon between products */}
                </div>
                <CardTitle className="text-lg font-semibold">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={product.imageSrc || "/placeholder.svg"}
                      alt={product.imageAlt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-base font-semibold">{product.price}</p>
                    {product.colorOptions && (
                      <Select defaultValue={product.colorOptions[0]?.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="size-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: option.hex }}
                                />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {product.sizeOptions && (
                      <Select defaultValue={product.sizeOptions[0]?.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.sizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {product.volumeOptions && (
                      <Select defaultValue={product.volumeOptions[0]?.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Volume" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.volumeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {product.materialOptions && (
                      <Select defaultValue={product.materialOptions[0]?.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Material" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.materialOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="mt-6 w-full bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  )
}
