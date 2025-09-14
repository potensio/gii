import { useState } from 'react';
import { useCart } from './use-cart';
import { SHIPPING_COST, TAX_RATE } from '../lib/checkout-schema';

export function useCheckout() {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [itemNotes, setItemNotes] = useState<{[key: string]: string}>({});
  const [showNotes, setShowNotes] = useState<{[key: string]: boolean}>({});

  // Kalkulasi harga
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * TAX_RATE;
  const finalTotal = subtotal + taxAmount + SHIPPING_COST;

  const handleItemNoteChange = (itemId: string, note: string) => {
    setItemNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const toggleNoteVisibility = (itemId: string) => {
    setShowNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const processCheckout = async (formData: any) => {
    setIsLoading(true);
    
    try {
      // Simulasi proses checkout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Di sini nanti akan redirect ke payment gateway
      alert('Checkout berhasil! Akan diarahkan ke payment gateway.');
      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan saat checkout. Silakan coba lagi.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    subtotal,
    taxAmount,
    finalTotal,
    shippingCost: SHIPPING_COST,
    isLoading,
    itemNotes,
    showNotes,
    handleItemNoteChange,
    toggleNoteVisibility,
    processCheckout
  };
}