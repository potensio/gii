"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const IndonesianFlag = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24">
    <g clipPath="url(#ID_svg__a)">
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z" fill="#F0F0F0" />
      <path d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12" fill="#A2001D" />
    </g>
    <defs>
      <clipPath id="ID_svg__a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

interface PriceInputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function PriceInput({ 
  id, 
  placeholder = "0", 
  value = "", 
  onChange,
  className 
}: PriceInputProps) {
  const [internalAmount, setInternalAmount] = useState("");

  // Use controlled value if provided, otherwise use internal state
  const amount = value !== undefined ? value : internalAmount;

  useEffect(() => {
    if (value !== undefined) {
      setInternalAmount(value);
    }
  }, [value]);

  const formatNumber = (value: string) => {
    // Remove all non-numeric characters except dots
    const numericValue = value.replace(/[^\d]/g, "");
    
    // Format with thousand separators
    if (numericValue) {
      return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
    }
    return "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove all non-numeric characters for processing
    const numericValue = inputValue.replace(/[^\d]/g, "");
    
    if (onChange) {
      onChange(numericValue);
    } else {
      setInternalAmount(numericValue);
    }
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm transition-all outline-primary focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2",
        className
      )}
    >
      <span className="text-muted-foreground mr-1">
        Rp
      </span>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        inputMode="numeric"
        value={formatNumber(amount)}
        onChange={handleAmountChange}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="h-4 w-px bg-border mx-2" />
      <div className="flex items-center gap-1 text-muted-foreground">
        <IndonesianFlag />
        <span className="text-xs">IDR</span>
      </div>
    </div>
  );
}
