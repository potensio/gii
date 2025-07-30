import Link from "next/link"

export function JoinClubSidebar() {
  return (
    <div className="fixed bottom-1/2 left-0 z-50 hidden -translate-y-1/2 transform md:block">
      <Link
        href="#"
        className="inline-flex items-center justify-center rounded-r-md bg-black px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg -rotate-90 origin-bottom-left"
      >
        Join The Club
      </Link>
    </div>
  )
}
