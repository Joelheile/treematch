"use client";

import { StudentOverview } from "@/components/StudentOverview";
import { AuthGuard } from "@/components/AuthGuard";
import { UserMenu } from "@/components/UserMenu";
import { Student } from "@/types/Student";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();

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
          (() => {
            router.push('/onboarding');
            return (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Redirecting to onboarding...</h1>
                </div>
              </div>
            );
          })()
        ) : (
          <StudentOverview students={students} />
        )}
      </div>
    </AuthGuard>
  );
}
