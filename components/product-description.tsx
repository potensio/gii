import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AdditionalDescription {
  title: string;
  body: string;
}

interface ProductDescriptionProps {
  description: string;
  additionalDescriptions?: AdditionalDescription[];
}

export function ProductDescription({
  description,
  additionalDescriptions,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-8">
      {additionalDescriptions && additionalDescriptions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {additionalDescriptions.map((addDesc, index) => (
            <AccordionItem key={`desc-${index}`} value={`desc-${index}`}>
              <AccordionTrigger className="text-xl font-semibold">
                {addDesc.title}
              </AccordionTrigger>
              <AccordionContent className="prose max-w-none text-foreground/80">
                {addDesc.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
