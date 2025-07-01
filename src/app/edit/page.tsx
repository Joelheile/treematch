import OnboardingLogic from "@/components/onboarding/OnboardingLogic";
import { getSafeSearchParam } from "@/lib/validation";

interface EditPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function EditPage({ searchParams }: EditPageProps) {
  const referralCode = getSafeSearchParam(searchParams, 'ref');
  
  return <OnboardingLogic referralCode={referralCode || undefined} />;
}
