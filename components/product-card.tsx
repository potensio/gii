import Image from "next/image";
import Link from "next/link"; // Import Link
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  imageSrc: string;
  imageAlt: string;
  brand: string;
  title: string;
  price: string;
  color?: string; // Hex color string for the swatch
  className?: string;
  slug: string; // Add slug prop for linking
}

export function ProductCard({
  imageSrc,
  imageAlt,
  brand,
  title,
  price,
  color,
  className,
  slug,
}: ProductCardProps) {
  return (
    <Link href={`/product/${slug}`} className="block">
      {" "}
      {/* Wrap with Link */}
      <Card
        className={cn(
          "overflow-hidden rounded-2xl shadow-sm border-none bg-neutral-50",
          className
        )}
      >
        <div className="relative aspect-square w-full">
          <Image
            src="/placeholder.svg"
            alt={imageAlt}
            fill
            className="rounded-t-xl object-cover opacity-0"
          />
        </div>
        <CardContent className="p-4 min-h-24">
          <p className="mb-1 text-xs uppercase text-muted-foreground tracking-wide">
            {brand}
          </p>
          <div className="flex flex-col items-start justify-between gap-2">
            <h3 className="w-full text-base font-light leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
              {title}
            </h3>

            <p className="text-sm font-semibold">{price}</p>
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
  );
}
