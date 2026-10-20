import { redirect } from "next/navigation";
import { validateReferralCode } from "@/lib/validation";

interface InvitePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  // Validate referral code before redirecting
  const validCode = validateReferralCode(code);

  if (!validCode) {
    // Invalid code - redirect to signup without referral
    redirect("/edit");
  }

  // Redirect to signup with validated referral code
  redirect(`/edit?ref=${encodeURIComponent(validCode)}`);
}
