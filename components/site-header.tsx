"use client" // Ensure this is a client component

import Link from "next/link"
import {
  Facebook,
  Instagram,
  PinIcon as Pinterest,
  Search,
  ShoppingCart,
  SnailIcon as Snapchat,
  InstagramIcon as Tiktok,
  Twitter,
  User,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SiteHeaderProps {
  onCartClick: () => void
}

export function SiteHeader({ onCartClick }: SiteHeaderProps) {
  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-black px-4 py-2 text-xs text-white md:px-8">
        <div className="flex items-center space-x-3">
          <Link href="#" aria-label="Facebook">
            <Facebook className="size-3" />
          </Link>
          <Link href="#" aria-label="X (Twitter)">
            <Twitter className="size-3" />
          </Link>
          <Link href="#" aria-label="Instagram">
            <Instagram className="size-3" />
          </Link>
          <Link href="#" aria-label="YouTube">
            <Youtube className="size-3" />
          </Link>
          <Link href="#" aria-label="TikTok">
            <Tiktok className="size-3" />
          </Link>
          <Link href="#" aria-label="Snapchat">
            <Snapchat className="size-3" />
          </Link>
          <Link href="#" aria-label="Pinterest">
            <Pinterest className="size-3" />
          </Link>
        </div>
        <span className="hidden text-center md:block">PROTECT YOU PEACE VOL.1 DROPPING SOON</span>
        <div className="flex items-center space-x-2">
          <span className="hidden md:block">Australia (AUD $)</span>
          <Select defaultValue="AUD">
            <SelectTrigger className="h-6 w-[80px] border-none bg-transparent text-white focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="AUD">AUD $</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="EUR">EUR €</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex items-center justify-between border-b bg-white px-4 py-4 md:px-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" />
          </Button>
        </div>
        <div className="flex-1 text-center">
          <Link href="#" className="text-2xl font-extrabold uppercase tracking-widest">
            Flowers & Saints
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <ul className="space-x-6 md:flex">
            <li>
              <Link href="#" className="text-sm font-medium hover:text-gray-700">
                Apparel
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-gray-700">
                Accessories
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-gray-700">
                For The Real Ones
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-gray-700">
                Who We Are
              </Link>
            </li>
          </ul>
          <Button variant="ghost" size="icon" aria-label="User Account">
            <User className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Shopping Cart" onClick={onCartClick}>
            <ShoppingCart className="size-5" />
          </Button>
        </div>
      </nav>
    </header>
  )
}
