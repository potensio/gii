import React from "react";
import Image from "next/image";

export function Procurement() {
  return (
    <>
      <div className="flex flex-col w-full gap-6 ">
        <h2 className="pl-5 text-2xl md:text-3xl font-semibold text-neutral-800 dark:text-neutral-200 font-sans">
          Pengadaan
        </h2>
        <div className="flex flex-col md:flex-row max-w-6xl bg-muted rounded-2xl mx-5 mt-5 h-96 items-center overflow-hidden self-center">
          <div className="flex flex-col p-10 gap-2 w-full">
            <h3 className="text-xl md:text-3xl font-medium text-center">
              Penawaran harga terbaik, dengan ketersediaan melimpah.
            </h3>
            <p className="text-center font-light text-sm md:text-base">
              With Apple Trade In, you can get a great value for your current
              device and apply it toward a new one. If your device isn’t
              eligible for credit, we’ll recycle it for free.
            </p>
          </div>
          <div className="w-full h-full relative">
            <Image
              src="https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              fill
              className="object-cover"
              alt="description"
            />
          </div>
        </div>
      </div>
    </>
  );
}
