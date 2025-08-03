import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductDescriptionProps {
  description: string;
  fabricFit: string;
  careInstructions: string;
}

export function ProductDescription({
  description,
  fabricFit,
  careInstructions,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-8 px-4 md:px-10">
      <h2 className="text-2xl font-semibold tracking-tighter">Deskripsi</h2>
      <div className="prose max-w-none space-y-4 text-gray-700">
        <p>{description}</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="fabric-fit">
          <AccordionTrigger className="text-lg font-semibold">
            Relax Crew Fabric & Fit
          </AccordionTrigger>
          <AccordionContent className="prose max-w-none text-gray-700">
            {fabricFit}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="care-instructions">
          <AccordionTrigger className="text-lg font-semibold">
            Relax Crew Care Instructions
          </AccordionTrigger>
          <AccordionContent className="prose max-w-none text-gray-700">
            {careInstructions}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
