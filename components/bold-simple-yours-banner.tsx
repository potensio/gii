import Image from "next/image"

export function BoldSimpleYoursBanner() {
  return (
    <section className="relative h-[400px] w-full overflow-hidden bg-black py-16 md:h-[500px] lg:h-[600px]">
      <Image
        src="/placeholder.svg?height=600&width=1600"
        alt="Background pattern"
        fill
        className="object-cover object-center opacity-30"
        priority
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center text-white">
        <p className="mb-4 text-sm uppercase tracking-widest text-gray-300">
          ELEVATE YOUR EVERYDAY WITH FLOWERS & SAINTS
        </p>
        <h2 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">Bold. Simple. Yours.</h2>
        <p className="max-w-3xl text-lg leading-relaxed text-gray-200">
          Discover designs that speak. Crafted to inspire, our exclusive collection of apparels, totes and bottles
          feature iconic prints that let your individuality shine.
        </p>
      </div>
    </section>
  )
}
