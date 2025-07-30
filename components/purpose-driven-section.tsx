import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PurposeDrivenSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left Column: Text Content */}
        <div className="space-y-6">
          <p className="text-sm uppercase text-gray-500">Flowers & Saints</p>
          <h2 className="text-2xl font-semibold tracking-tighter leading-tight md:text-4xl">
            Designed with Purpose. Worn <br /> with Meaning.
            {/* Wavy underline effect */}
            <div className="mt-2 h-2 w-full bg-[url('/placeholder.svg?height=8&width=200')] bg-no-repeat bg-left-bottom" />
          </h2>
          <p className="text-gray-700">
            <span className="font-bold">Flowers & Saints</span> is where streetwear meets soul. We don't just make
            products — we craft <span className="font-bold">statements</span>. Every item is designed to reflect
            individuality, precision, and power. Rooted in storytelling, elevated through design, and driven by emotion
            — our collections exist to move you.
          </p>
          <p className="text-gray-700">
            Explore iconic essentials engineered with care. Created to last. Built to inspire.
          </p>
        </div>

        {/* Right Column: Image Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Liquid Soul */}
          <div className="relative h-96 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Liquid Soul"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold">Liquid Soul</h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-6 right-6 rounded-full bg-white text-black hover:bg-gray-100"
                aria-label="Learn more about Liquid Soul"
              >
                <Plus className="size-6" />
              </Button>
            </div>
          </div>

          {/* Card 2: Urban Poetics */}
          <div className="relative h-96 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Urban Poetics"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold">Urban Poetics</h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-6 right-6 rounded-full bg-white text-black hover:bg-gray-100"
                aria-label="Learn more about Urban Poetics"
              >
                <Plus className="size-6" />
              </Button>
            </div>
          </div>

          {/* Card 3: Verse Carry */}
          <div className="relative h-96 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Verse Carry"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold">Verse Carry</h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-6 right-6 rounded-full bg-white text-black hover:bg-gray-100"
                aria-label="Learn more about Verse Carry"
              >
                <Plus className="size-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
