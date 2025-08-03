"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";

interface MainNavigationProps {
  isCartOpen: boolean;
  onCartClick: () => void;
  onCloseCart: () => void;
}

export function MainNavigation({
  isCartOpen,
  onCartClick,
  onCloseCart,
}: MainNavigationProps) {
  return (
    <nav className="sticky w-full z-50 top-0 flex items-center justify-between bg-background px-4 h-[64px] md:h-[100px] md:px-8 space-x-16">
      <div className="flex flex-1 justify-between items-center space-x-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="flex items-center justify-start">
          <ul className="hidden space-x-12 md:flex">
            <li>
              <Link
                href="/"
                className="text-lg hover:text-gray-700"
                prefetch={true}
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link href="#" className="text-lg hover:text-gray-700">
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
              <Link
                href="/shop"
                className="text-lg hover:text-gray-700"
                prefetch={true}
              >
                Belanja
              </Link>
            </li>
            <li>
              <Link href="#" className="text-lg hover:text-gray-700">
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
            onClick={onCartClick}
          >
            <ShoppingCart className="size-5" strokeWidth={1.5} />
          </Button>
          <CartDrawer isOpen={isCartOpen} onClose={onCloseCart} />
        </div>
      </div>
    </nav>
  );
}
