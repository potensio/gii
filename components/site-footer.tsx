import Link from "next/link"
import {
  Facebook,
  Instagram,
  PinIcon as Pinterest,
  SnailIcon as Snapchat,
  InstagramIcon as Tiktok,
  Twitter,
  Youtube,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteFooter() {
  return (
    <footer className="relative bg-black px-4 py-16 text-white md:px-8 lg:py-24">
      <div className="container mx-auto grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
        {/* Logo */}
        <div className="col-span-1 md:col-span-1">
          <Link href="#" className="text-3xl font-extrabold uppercase tracking-widest">
            Flowers & Saints
          </Link>
        </div>

        {/* Quick Links */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Quick links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="#" className="hover:text-white">
                Apparel
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Accessories
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                For The Real Ones
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Who We Are
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Contact</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>+61 481136337</p>
            <p>
              <Link href="mailto:wecare@flowersandsaints.com.au" className="hover:text-white">
                wecare@flowersandsaints.com.au
              </Link>
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">
            Stay updated about the latest releases and get exclusive deals :-)
          </h3>
          <div className="flex w-full max-w-md">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-r-none border-r-0 border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus:border-white focus:ring-0"
            />
            <Button type="submit" className="rounded-l-none bg-gray-700 px-4 hover:bg-gray-600" aria-label="Subscribe">
              <ArrowRight className="size-5" />
            </Button>
          </div>
          <div className="mt-6 flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <Facebook className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="X (Twitter)">
              <Twitter className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <Youtube className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="TikTok">
              <Tiktok className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="Snapchat">
              <Snapchat className="size-5 text-gray-300 hover:text-white" />
            </Link>
            <Link href="#" aria-label="Pinterest">
              <Pinterest className="size-5 text-gray-300 hover:text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto mt-16 flex flex-col items-center justify-between space-y-4 border-t border-gray-700 pt-8 text-center text-xs text-gray-400 md:flex-row md:space-y-0">
        <p>&copy; {new Date().getFullYear()} Flowers & Saints Designed and Developed with ❤️ by Dollar Gill.</p>
        <div className="flex flex-wrap justify-center space-x-4">
          <Link href="#" className="hover:text-white">
            Privacy policy
          </Link>
          <Link href="#" className="hover:text-white">
            Refund policy
          </Link>
          <Link href="#" className="hover:text-white">
            Terms of service
          </Link>
          <Link href="#" className="hover:text-white">
            Shipping policy
          </Link>
          <Link href="#" className="hover:text-white">
            Contact information
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
          <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
        </div>
      </div>
    </footer>
  )
}
