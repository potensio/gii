import { Icon } from "@/components/ui/evervault-card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function Pricing() {
  const featuresA = [
    {
      commingSoon: false,
      description: "5 users ($5/month per user)",
      helperText: "Add up to 10 users with a monthly cost per user",
    },
    {
      commingSoon: false,
      description: "Reservation Management",
      helperText: "",
    },
    {
      commingSoon: true,
      description: "Online Payments",
      helperText: "Coming in Q3 2025",
    },
    {
      commingSoon: true,
      description: "Point of Sales",
      helperText: "Comming in Q1 2025",
    },
    {
      commingSoon: true,
      description: "Self Order",
      helperText: "Comming in Q2 2025",
    },
    {
      commingSoon: false,
      description: "Email Support",
      helperText: "Access email-based customer support",
    },
  ];

  return (
    <>
      <div className="h-fit w-full flex flex-col bg-background antialiased bg-grid-black/[0.04] dark:bg-grid-white/[0.04] relative overflow-hidden gap-20 py-8">
        <div className=" p-4 flex flex-col justify-center items-center max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <h2 className="text-5xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-300 bg-opacity-50">
            It's now, or later.
          </h2>
          <p className="mt-4 font-normal text-lg text-muted-foreground text-center mx-auto max-w-2xl">
            We understand that moving from one system to another is difficult.
            That’s why we offer a 30-day free trial—no credit card required.
          </p>
        </div>

        <div className="max-w-2xl mx-auto w-full bg-muted">
          <Slider defaultValue={[33]} max={100} step={1} />
        </div>

        <div className="border bg-background flex flex-col justify-between w-full max-w-xs mx-auto p-8 relative h-fit">
          <div className="flex flex-col">
            <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

            <h4 className="font-semibold">Monthly</h4>
            <h3 className="mt-3 mb-6 text-3xl font-semibold">$0/mo</h3>

            {featuresA.map((item, index) => (
              <div className="flex w-full h-fit items-center mt-2" key={index}>
                <Check className="text-accent-foreground size-4 mr-2 item" />
                <p className="font-normal text-sm text-muted-foreground max-w-2xl">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <Button variant={"outline"} size={"lg"} className="mt-6">
            <p className="">Get Started</p>
          </Button>
        </div>
      </div>
    </>
  );
}
