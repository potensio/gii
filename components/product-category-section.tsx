import Image from "next/image";

export function ProductCategorySection() {
  return (
    <section className="w-full flex px-4 md:px-10 items-center justify-center object-center">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column: Text Content */}
        <div className="space-y-6 lg:col-span-1">
          <p className="text-sm uppercase text-gray-500">Brand</p>
          <h2 className="text-3xl font-semibold tracking-tighter leading-tight md:text-4xl">
            Temukan produk favorit anda.
            {/* Wavy underline effect */}
            <div className="mt-2 h-2 w-full bg-[url('/placeholder.svg?height=8&width=200')] bg-no-repeat bg-left-bottom" />
          </h2>
          <p className="text-gray-700">
            Nikmati akses ke produk-produk unggulan dari brand terkemuka. Dengan{" "}
            <span className="font-bold">harga terbaik</span> dan variant yang
            melimpah, agar Anda tidak kehilangan momentum saat membutuhkannya.
          </p>
        </div>

        {/* Right Column: Image Cards */}
        <div className="grid gap-4 grid-cols-3 lg:col-span-2">
          {/* Card 1: Liquid Soul */}
          <div className="relative h-80 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Liquid Soul"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Card 2: Urban Poetics */}
          <div className="relative h-80 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Urban Poetics"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Card 3: Verse Carry */}
          <div className="relative h-80 overflow-hidden rounded-xl bg-gray-200">
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Verse Carry"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
