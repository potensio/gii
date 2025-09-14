"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCheckoutForm } from "../../../hooks/use-checkout-form";
import { useCheckout } from "../../../hooks/use-checkout";
import { CheckoutForm } from "../../../components/checkout/checkout-form";
import { OrderSummary } from "../../../components/checkout/order-summary";
import { CartItemCard } from "../../../components/checkout/cart-item-card";

export default function CheckoutSummaryPage() {
  const router = useRouter();
  const { form, errors, handleSubmit } = useCheckoutForm();
  const {
    items,
    subtotal,
    taxAmount,
    finalTotal,
    shippingCost,
    isLoading,
    itemNotes,
    showNotes,
    handleItemNoteChange,
    toggleNoteVisibility,
    processCheckout
  } = useCheckout();

  // Redirect jika tidak ada item di cart
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  const onSubmit = async (formData: any) => {
    const success = await processCheckout(formData);
    if (success) {
      // Redirect ke payment gateway atau success page
      console.log('Checkout successful', { formData, itemNotes });
    }
  };

  if (items.length === 0) {
    return null; // Akan redirect ke /cart
  }

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full">
      <div className="flex flex-col flex-1 p-4 max-w-7xl mx-auto md:p-8 gap-10">
        <h1 className="text-4xl font-semibold tracking-tighter">Checkout</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left Section - Form and Items */}
            <div className="flex-1 space-y-8">
              {/* Checkout Form */}
              <CheckoutForm form={form} errors={errors} />
              
              {/* Cart Items with Notes */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Item Pesanan</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      note={itemNotes[item.id] || ''}
                      showNote={showNotes[item.id] || false}
                      onNoteChange={(note) => handleItemNoteChange(item.id, note)}
                      onToggleNote={() => toggleNoteVisibility(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Section - Order Summary */}
            <aside className="w-full lg:w-[400px] flex-shrink-0">
              <OrderSummary
                subtotal={subtotal}
                taxAmount={taxAmount}
                shippingCost={shippingCost}
                finalTotal={finalTotal}
                itemCount={items.length}
                isLoading={isLoading}
                onCheckout={handleSubmit(onSubmit)}
              />
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
