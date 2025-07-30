import Image from "next/image"

interface Specification {
  iconSrc: string
  iconAlt: string
  label: string
  value: string
}

interface ProductSpecificationsProps {
  specifications: Specification[]
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold">Specifications</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {specifications.map((spec, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="relative mb-2 size-16">
              <Image src={spec.iconSrc || "/placeholder.svg"} alt={spec.iconAlt} fill className="object-contain" />
            </div>
            <p className="text-sm font-medium">{spec.label}</p>
            <p className="text-xs text-gray-600">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
