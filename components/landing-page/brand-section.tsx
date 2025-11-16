import Image from "next/image";
import { Separator } from "../ui/separator";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";

const brands = [
  {
    name: "Samsung",
    image: "/brand-logo/logo-samsung.png",
  },
  {
    name: "Apple",
    image: "/brand-logo/logo-apple.png",
  },
  { name: "Sony", image: "/brand-logo/logo-sony.png" },
  { name: "LG", image: "/brand-logo/logo-lg.png" },
];

export function BrandSection() {
  return (
    <section className="w-full flex px-4 md:px-10 items-center justify-center object-center">
      <div className="grid lg:grid-cols-3 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6 lg:col-span-1">
          <h2 className="text-3xl font-semibold tracking-tighter leading-tight md:text-4xl">
            Temukan produk favorit anda.
            {/* Wavy underline effect */}
            <Separator className="w-full h-1 bg-border mt-2" />
          </h2>
          <p className="leading-relaxed text-foreground/80">
            Nikmati akses ke produk-produk unggulan dari brand terkemuka. Dengan{" "}
            harga terbaik dan variant yang melimpah.
          </p>
        </div>

        {/* Right Column: Image Cards */}
        <div className="grid lg:col-span-2 md:px-20 mt-10 md:mt-0">
          <Marquee>
            <MarqueeFade side="left" />
            <MarqueeFade side="right" />
            <MarqueeContent>
              {brands.map((brand, index) => (
                <MarqueeItem
                  className="flex h-32 w-48 items-center justify-center"
                  key={index}
                >
                  <Image
                    alt={brand.name}
                    className="overflow-hidden"
                    src={brand.image}
                    width={128}
                    height={128}
                  />
                </MarqueeItem>
              ))}
            </MarqueeContent>
          </Marquee>
        </div>
      </div>
    </section>
  );
}
