import Link from "next/link";
import {
  Facebook,
  Instagram,
  PinIcon as Pinterest,
  SnailIcon as Snapchat,
  InstagramIcon as Tiktok,
  Twitter,
  Youtube,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  return (
    <footer className="relative bg-black px-4 py-16 text-white md:px-8">
      <div className="justify-center grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        {/* Logo */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Link
            href="#"
            className="text-3xl font-extrabold uppercase tracking-widest"
          >
            Global Inovasi Industri
          </Link>
        </div>

        {/* Quick Links */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="mb-6 text-xl font-semibold">Links</h3>
          <ul className="space-y-3 font-light text-lg tracking-normal text-gray-300">
            <li>
              <Link href="#" className="hover:text-white">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Kontak
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Belanja
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Daftar
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="mb-6 text-lg font-semibold">Hubungi Kami</h3>
          <div className="space-y-3 font-light tracking-normal text-gray-300">
            <p>+62 877 7102 9800</p>
            <p>
              <Link
                href="mailto:wecare@flowersandsaints.com.au"
                className="hover:text-white"
              >
                halo@email.com
              </Link>
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="col-span-2">
          <h3 className="mb-4 text-2xl lg:text-4xl font-medium tracking-tighter leading-tighter">
            Dapatkan update terbaru dan Diskon eksklusif
          </h3>
          <div className="flex w-full max-w-md">
            <Input
              type="email"
              placeholder="Masukkan email kamu"
              className="flex-1 h-12 rounded-r-none border-r-0 text-white placeholder:text-gray-400 focus:border-white focus:ring-0"
            />
            <Button
              type="submit"
              className="rounded-l-none h-12 bg-primary px-4 hover:bg-gray-600"
              aria-label="Subscribe"
            >
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
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 flex flex-col items-center justify-between space-y-4 border-t border-gray-700 pt-8 text-center text-xs text-gray-400 md:flex-row md:space-y-0">
        <p>
          &copy; {new Date().getFullYear()} Global Inovasi Industri and
          Developed by{" "}
          <Link
            href="https://thenightshift.dev"
            className="hover:text-pink-500"
          >
            thenightshift.dev
          </Link>
          .
        </p>
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
        </div>
      </div>
    </footer>
  );
}
