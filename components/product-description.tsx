import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SubDescription {
  id: string;
  title: string;
  content: string;
}

interface ProductDescriptionProps {
  description: string;
  subDescriptions?: SubDescription[] | null;
}

export function ProductDescription({
  description,
  subDescriptions,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-8 px-4 md:px-10">
      <h2 className="text-2xl font-semibold tracking-tighter">Deskripsi</h2>
      <div className="prose max-w-none space-y-4 text-gray-700">
        <p>{description}</p>
      </div>

      {subDescriptions && subDescriptions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {subDescriptions.map((subDesc) => (
            <AccordionItem key={subDesc.id} value={subDesc.id}>
              <AccordionTrigger className="text-lg font-semibold">
                {subDesc.title}
              </AccordionTrigger>
              <AccordionContent className="prose max-w-none text-gray-700">
                {subDesc.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
