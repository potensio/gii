"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

const dummyAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Rumah",
    recipientName: "John Doe",
    phone: "+62 812-3456-7890",
    fullAddress: "Jl. Sudirman No. 123, RT 01/RW 02",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12190",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    recipientName: "John Doe",
    phone: "+62 812-3456-7890",
    fullAddress: "Jl. Gatot Subroto Kav. 52-53",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12950",
    isDefault: false,
  },
  {
    id: "addr-3",
    label: "Rumah Orang Tua",
    recipientName: "Jane Doe",
    phone: "+62 813-9876-5432",
    fullAddress: "Jl. Thamrin No. 45, RT 03/RW 05",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    postalCode: "10350",
    isDefault: false,
  },
];

interface AddressSelectorProps {
  onAddressSelect?: (addressId: string) => void;
}

export function AddressSelector({ onAddressSelect }: AddressSelectorProps) {
  const defaultAddress = dummyAddresses.find((addr) => addr.isDefault);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddress?.id || dummyAddresses[0].id
  );

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    onAddressSelect?.(addressId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pilih Alamat Pengiriman</h2>
      <RadioGroup value={selectedAddressId} onValueChange={handleAddressChange}>
        <div className="space-y-3">
          {dummyAddresses.map((address) => (
            <Card
              key={address.id}
              className={`relative p-4 cursor-pointer transition-all ${
                selectedAddressId === address.id
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleAddressChange(address.id)}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem
                  value={address.id}
                  id={address.id}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={address.id}
                      className="font-semibold cursor-pointer"
                    >
                      {address.recipientName}
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {address.label}
                    </Badge>
                    {address.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{address.phone}</p>
                    <p>{address.fullAddress}</p>
                    <p>
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
