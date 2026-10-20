import OnboardingLogic from "@/components/onboarding/OnboardingLogic";
import { getSafeSearchParam } from "@/lib/validation";

interface EditPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditPage({ searchParams }: EditPageProps) {
  const referralCode = getSafeSearchParam(await searchParams, "ref");

  return <OnboardingLogic referralCode={referralCode || undefined} />;
}
