import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutFormSchema, CheckoutFormData } from '../lib/checkout-schema';

export function useCheckoutForm() {
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      nama: '',
      email: '',
      nomorTelepon: '',
      alamatLengkap: '',
      kota: '',
      provinsi: '',
      kodePos: ''
    }
  });

  const isValid = form.formState.isValid;
  const errors = form.formState.errors;
  const isSubmitting = form.formState.isSubmitting;

  return {
    form,
    isValid,
    errors,
    isSubmitting,
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues
  };
}