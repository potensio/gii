import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AboutSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-8 lg:py-24">
      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Our brand is more than just clothing – it's a movement.
          </h2>
          <Button
            variant="outline"
            asChild
            className="group border-black px-6 py-3 text-black hover:bg-black hover:text-white bg-transparent"
          >
            <Link href="#">
              Our Story
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="space-y-6 text-gray-700">
          <p>
            At Flowers & Saints, we believe in wearing your story with pride. Every product we design is crafted with
            intention, combining style, quality, and purpose. Whether you're looking for a staple piece or something
            that speaks to your unique journey, we've got you covered.
          </p>
          <p className="font-semibold">Explore Our Journey</p>
          <p>Discover the passion behind our designs and the community we're building together.</p>
        </div>
      </div>
    </section>
  )
}
