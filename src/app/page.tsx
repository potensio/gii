/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";

import { Hero } from "@/components/landing/hero";
import Footer from "@/components/landing/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppleCardsCarouselDemo } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { LayoutGridDemo } from "@/components/landing/grid";
import { TextHoverEffectDemo } from "@/components/landing/gii";
import { ExpandableCardDemo } from "@/components/landing/cards";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Procurement } from "@/components/landing/procurement";

export default function Home() {
  return (
    <>
      <div className="flex flex-col bg-background gap-10">
        <div className="fixed right-10 bottom-10 z-50">
          <ThemeToggle />
        </div>
        <Hero />
        <ExpandableCardDemo />
        <AppleCardsCarouselDemo />
        <Procurement />
        <LayoutGridDemo />

        <Footer />
        <div className="flex flex-col">
          <TextHoverEffect text={"PT GLOBAL INOVASI INDUSTRI "} />
        </div>
      </div>
    </>
  );
}
