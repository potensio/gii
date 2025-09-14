import { GalleryVerticalEnd } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-1 min-h-svh items-center justify-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </>
  );
}
