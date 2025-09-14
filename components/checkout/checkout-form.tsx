import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { CheckoutFormData } from "../../lib/checkout-schema";

interface CheckoutFormProps {
  form: UseFormReturn<CheckoutFormData>;
  errors: any;
}

export function CheckoutForm({ form, errors }: CheckoutFormProps) {
  const { register } = form;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Informasi Pengiriman</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nama">Nama Lengkap *</Label>
          <Input
            id="nama"
            {...register("nama")}
            className={errors.nama ? "border-red-500" : ""}
          />
          {errors.nama && (
            <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="nomorTelepon">Nomor Telepon *</Label>
        <Input
          id="nomorTelepon"
          {...register("nomorTelepon")}
          className={errors.nomorTelepon ? "border-red-500" : ""}
        />
        {errors.nomorTelepon && (
          <p className="text-red-500 text-sm mt-1">{errors.nomorTelepon.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="alamatLengkap">Alamat Lengkap *</Label>
        <Input
          id="alamatLengkap"
          {...register("alamatLengkap")}
          className={errors.alamatLengkap ? "border-red-500" : ""}
        />
        {errors.alamatLengkap && (
          <p className="text-red-500 text-sm mt-1">{errors.alamatLengkap.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="kota">Kota *</Label>
          <Input
            id="kota"
            {...register("kota")}
            className={errors.kota ? "border-red-500" : ""}
          />
          {errors.kota && (
            <p className="text-red-500 text-sm mt-1">{errors.kota.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="provinsi">Provinsi *</Label>
          <Input
            id="provinsi"
            {...register("provinsi")}
            className={errors.provinsi ? "border-red-500" : ""}
          />
          {errors.provinsi && (
            <p className="text-red-500 text-sm mt-1">{errors.provinsi.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="kodePos">Kode Pos *</Label>
          <Input
            id="kodePos"
            {...register("kodePos")}
            className={errors.kodePos ? "border-red-500" : ""}
          />
          {errors.kodePos && (
            <p className="text-red-500 text-sm mt-1">{errors.kodePos.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}