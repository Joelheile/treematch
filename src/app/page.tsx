"use client";

import { OnboardingFlow } from "@/components/OnboardingFlow";
import { StudentOverview } from "@/components/StudentOverview";
import { AuthGuard } from "@/components/AuthGuard";
import { UserMenu } from "@/components/UserMenu";
import { Student } from "@/types/Student";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem("stanford-onboarded");
    const savedStudents = localStorage.getItem("stanford-students");

    if (onboardingStatus === "true") {
      setIsOnboarded(true);
    }

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const handleOnboardingComplete = (studentData: Student) => {
    const updatedStudents = [...students, studentData];
    setStudents(updatedStudents);
    localStorage.setItem("stanford-students", JSON.stringify(updatedStudents));
    localStorage.setItem("stanford-onboarded", "true");
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("stanford-onboarded");
    setIsOnboarded(false);
  };

  return (
    <AuthGuard>
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <UserMenu />
        </div>
        {!isOnboarded ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <StudentOverview students={students} onReset={resetOnboarding} />
        )}
      </div>
    </AuthGuard>
  );
}
