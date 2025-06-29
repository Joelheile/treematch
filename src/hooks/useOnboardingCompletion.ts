import { useCurrentStudent } from "./useCurrentStudent";

export const useOnboardingCompletion = () => {
  const { student, isLoading } = useCurrentStudent();

  const isOnboardingComplete = Boolean(
    student?.isOnboarded &&
    student?.coolest_thing?.trim() &&
    student?.goals?.trim()
  );

  const hasCompletedBasicOnboarding = Boolean(student?.isOnboarded);

  return {
    isOnboardingComplete,
    hasCompletedBasicOnboarding,
    isLoading,
    student
  };
};