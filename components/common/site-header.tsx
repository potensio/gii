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

export function SiteHeader() {
  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-black px-4 py-2 text-xs text-white md:px-6">
        <div className="flex items-center space-x-3"></div>
        <div className="flex items-center space-x-1">
          <Locate className="size-3" strokeWidth={1.5} />{" "}
          <p className="text-xs font-light">Ciputat, Tangerang Selatan.</p>
        </div>
      </div>
    </header>
  );
}
