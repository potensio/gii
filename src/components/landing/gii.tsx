import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export function TextHoverEffectDemo({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <TextHoverEffect text={text} />
    </div>
  );
}
