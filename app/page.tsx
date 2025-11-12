import { MainNavigation } from "@/components/common/main-navigation";
import { HeroSection } from "@/components/hero-section";
import { BrandSection } from "@/components/landing-page/brand-section";
import { GuaranteeSection } from "@/components/landing-page/guarantee-section";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { SiteFooter } from "@/components/common/site-footer";
import { TillDeathBundleSection } from "@/components/till-death-bundle-section";
import { StoryBanner } from "@/components/story-banner";
import { formatPrice } from "@/lib/utils/product.utils";
import { stringify } from "querystring";

interface SimplifiedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface ProductAPIResponse {
  success: boolean;
  message: string;
  data: SimplifiedProduct[];
}

interface CarouselProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  thumbnailUrl: string | null;
}

async function fetchProducts(
  sortBy: "newest" | "random"
): Promise<CarouselProduct[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/products?sortBy=${sortBy}&limit=10`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${sortBy} products:`, response.statusText);
      return [];
    }

    const result: ProductAPIResponse = await response.json();
    console.log(result);
    if (!result.success || !result.data) {
      return [];
    }

    // Transform API response to CarouselProduct format
    return result.data.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      price: formatPrice(product.price),
      thumbnailUrl: product.thumbnailUrl,
    }));
  } catch (error) {
    console.error(`Error fetching ${sortBy} products:`, error);
    return [];
  }
}

export default async function Home() {
  // Fetch newest and random products in parallel
  const [newestProducts, randomProducts] = await Promise.all([
    fetchProducts("newest"),
    fetchProducts("random"),
  ]);

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full">
      <main className="flex-col flex-1">
        <MainNavigation />
        <div className="flex flex-col gap-20">
          <HeroSection />
          <BrandSection />
          <ProductCarouselSection title="Terbaru" products={newestProducts} />
          <GuaranteeSection />
          <ProductCarouselSection
            title="Paling Laris"
            products={randomProducts}
          />
          <TillDeathBundleSection />
          <StoryBanner />
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
