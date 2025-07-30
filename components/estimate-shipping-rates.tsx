"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function EstimateShippingRates() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="shipping-rates">
        <AccordionTrigger className="text-base font-semibold">Estimate shipping rates</AccordionTrigger>
        <AccordionContent className="text-sm text-gray-600">
          Shipping rates are calculated at checkout based on your location and selected shipping method. Please proceed
          to checkout to see the final shipping cost.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
