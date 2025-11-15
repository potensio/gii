"use client";

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
import CircularText from "../CircularText/CircularText";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  const [scrollY, setScrollY] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the footer is visible
        const footerTop = rect.top;
        const footerHeight = rect.height;

        // Start parallax when footer enters viewport
        if (footerTop < windowHeight && footerTop > -footerHeight) {
          const scrollProgress =
            (windowHeight - footerTop) / (windowHeight + footerHeight);
          setScrollY(scrollProgress * 50); // Adjust multiplier for parallax intensity
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      ref={footerRef}
      className="relative bg-black px-6 sm:px-10 py-20 text-white"
      style={{
        transform: `translateY(${scrollY}px)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="flex flex-col md:flex-row gap-20 lg:mx-auto col-span-1">
          {/* Logo */}
          <div className="w-full md:w-fit hidden lg:block">
            <CircularText
              text="GLOBAL*INOVASI*INDUSTRI*"
              onHover="speedUp"
              spinDuration={40}
              className="custom-class"
            />
          </div>

          {/* Links */}
          <div className="flex w-full col-span-1 gap-20">
            {/* Pages */}
            <div className="w-full">
              <h3 className="mb-6 font-medium">Tautan</h3>
              <ul className="space-y-3 font-light tracking-normal text-gray-300">
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
            <div className="w-full">
              <h3 className="mb-6 font-medium">Hubungi Kami</h3>
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
          </div>
        </div>

        {/* Newsletter */}
        <div className="col-span-1 items-center">
          <div className="flex flex-col max-w-md mx-auto">
            {" "}
            <h3 className="text-2xl md:text-3xl mb-4 tracking-tight">
              Dapatkan update terbaru dan diskon eksklusif
            </h3>
            <div className="flex w-full">
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
            Kebijakan Privasi
          </Link>
          <Link href="#" className="hover:text-white">
            Refund policy
          </Link>
          <Link href="#" className="hover:text-white">
            Kebijakan Layanan
          </Link>
          <Link href="/d" className="hover:text-white">
            Admin
          </Link>
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
  );
}
