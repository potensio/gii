import { VerifyForm } from "@/components/auth/verify";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    code?: string;
  }>;
}) {
  const { type, code } = await searchParams;

  if (!type || !code) {
    return (
      <div>
        <p>Invalid verification link</p>
      </div>
    );
  }

  return (
    <div>
      <VerifyForm type={type} code={code} />
    </div>
  );
}
