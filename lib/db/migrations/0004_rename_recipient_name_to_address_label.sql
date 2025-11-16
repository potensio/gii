-- Migration: Rename recipient_name to address_label in addresses table
-- This changes the field from "Nama Penerima" to "Nama Alamat"

ALTER TABLE "addresses" RENAME COLUMN "recipient_name" TO "address_label";
