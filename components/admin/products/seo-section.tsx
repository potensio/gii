"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SEOSectionProps {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
}

export function SEOSection({
  metaTitle,
  metaDescription,
  keywords,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
}: SEOSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold tracking-tight border-b pb-2">
        SEO & Metatag
      </h2>
      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            placeholder="iPhone 14 Pro Max - Premium Smartphone | Your Store"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            placeholder="Discover the iPhone 14 Pro Max with advanced camera system, A16 Bionic chip, and stunning display. Available in multiple colors and storage options."
            className="min-h-[80px]"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            placeholder="iPhone, smartphone, Apple, mobile phone, premium phone"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}