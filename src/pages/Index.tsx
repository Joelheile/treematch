
import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { StudentOverview } from "@/components/StudentOverview";
import { Student } from "@/types/Student";

const Index = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem('stanford-onboarded');
    const savedStudents = localStorage.getItem('stanford-students');
    
    if (onboardingStatus === 'true') {
      setIsOnboarded(true);
    }
    
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const handleOnboardingComplete = (studentData: Student) => {
    const updatedStudents = [...students, studentData];
    setStudents(updatedStudents);
    localStorage.setItem('stanford-students', JSON.stringify(updatedStudents));
    localStorage.setItem('stanford-onboarded', 'true');
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('stanford-onboarded');
    setIsOnboarded(false);
  };

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <StudentOverview students={students} onReset={resetOnboarding} />;
};

export default Index;
