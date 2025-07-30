import Image from "next/image"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TillDeathBundleSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-8 lg:py-24">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Background Image with Text Overlay */}
        <div className="relative h-[600px] overflow-hidden rounded-xl md:h-[700px]">
          <Image
            src="/placeholder.svg?height=700&width=700"
            alt="Till Death Drips Hot Bundle Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 rounded-xl bg-black/40" />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white md:p-12">
            <h2 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">Till Death Drips Hot Bundle</h2>
            <p className="mb-6 text-lg font-semibold">Bold by Design. Built to Last.</p>
            <p className="text-base leading-relaxed text-gray-200">
              Unapologetically expressive, the <span className="italic">Till Death Drips Hot Bundle</span> is more than
              just utility—it's a ritual in motion. This limited duo features the{" "}
              <span className="italic">Eco Canvas Tote Bag</span> in Blood Oath and the{" "}
              <span className="italic">Signature Bottle</span> in Sacred Shadow. Whether you're on a quick city run or
              deep in creative flow, these everyday icons are engineered to turn heads and inspire presence.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-200">
              Lightweight. Durable. Fierce. Each piece drips with conviction—carrying not just your essentials, but your
              identity.
            </p>
          </div>
        </div>

        {/* Right Column: Product Cards and Add to Cart */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Card 1: Bottle */}
            <Card className="relative overflow-hidden rounded-xl border-none shadow-none">
              <div className="relative h-64 w-full bg-black">
                <Image
                  src="/placeholder.svg?height=256&width=256"
                  alt="Till Death Drips Hot - Bottle"
                  fill
                  className="object-contain object-center"
                />
              </div>
              <CardContent className="p-4">
                <p className="mb-1 text-xs uppercase text-gray-500">FLOWERS & SAINTS</p>
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-medium leading-tight">Till Death Drips Hot - Bottle</h3>
                  <p className="ml-4 text-sm font-semibold">$39.00</p>
                </div>
                <div className="mt-4 space-y-2">
                  <Select defaultValue="sacred-shadow">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sacred-shadow">Sacred Shadow</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="500ml">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500ml">500ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Plus Icon between cards */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md">
              <Plus className="size-6 text-gray-700" />
            </div>

            {/* Product Card 2: Tote Bag */}
            <Card className="relative overflow-hidden rounded-xl border-none shadow-none">
              <div className="relative h-64 w-full bg-red-600">
                <Image
                  src="/placeholder.svg?height=256&width=256"
                  alt="Till Death Drips Hot - Eco Canvas Tote Bag"
                  fill
                  className="object-contain object-center"
                />
              </div>
              <CardContent className="p-4">
                <p className="mb-1 text-xs uppercase text-gray-500">FLOWERS & SAINTS</p>
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-medium leading-tight">Till Death Drips Hot - Eco Canvas Tote Bag</h3>
                  <p className="ml-4 text-sm font-semibold">$19.00</p>
                </div>
                <div className="mt-4 space-y-2">
                  <Select defaultValue="blood-oath">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood-oath">Blood Oath</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="canvas">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Bag/Case material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="canvas">Canvas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add to Cart Button */}
          <Button className="mt-8 w-full bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
            Add to cart
          </Button>
        </div>
      </div>
    </section>
  )
}
