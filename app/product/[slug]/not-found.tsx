import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <PackageX className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Product Not Found
        </h1>

        <p className="mb-8 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or is no longer
          available. It may have been removed or the link might be incorrect.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/shop">Browse products</Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
