"use client"; // Ensure this is a client component

import Link from "next/link";
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
  Locate,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  onCartClick: () => void;
}

export function SiteHeader({ onCartClick }: SiteHeaderProps) {
  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-black px-4 py-2 text-xs text-white md:px-8">
        <div className="flex items-center space-x-3">
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
        <div className="flex items-center space-x-1">
          <Locate className="size-4" strokeWidth={1.5} />{" "}
          <p className="text-xs">Ciputat, Tangerang Selatan.</p>
        </div>
      </div>
    </header>
  );
}
