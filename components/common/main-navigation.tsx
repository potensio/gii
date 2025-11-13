"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";

export function MainNavigation() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <nav className="w-full z-50 top-0 flex items-center justify-between bg-background px-4 h-[64px] md:h-[80px] md:px-8 space-x-16 border-b border-border">
      <div className="flex flex-1 justify-between items-center space-x-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="flex items-center justify-start">
          <ul className="hidden space-x-12 md:flex">
            <li>
              <Link href="/" className="hover:text-primary" prefetch={true}>
                Beranda
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Kontak
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-0 text-center">
        <Link
          href="#"
          className="text-2xl font-semibold uppercase tracking-widest"
        >
          GII
        </Link>
      </div>
      <div className="flex flex-1 justify-between items-center space-x-4">
        <div className="flex items-center justify-start">
          <ul className="hidden space-x-12 md:flex">
            <li>
              <Link href="/shop" className="hover:text-primary" prefetch={true}>
                Produk
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className="hover:text-primary">
                Daftar
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="User Account">
            <User className="size-5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Shopping Cart"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="size-5" strokeWidth={1.5} />
          </Button>
          <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
        </div>
      </div>
    </nav>
  );
}
