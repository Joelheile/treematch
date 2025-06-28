"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  isSubmitting: boolean;
  user: any;
  student: any;
  handleNext: () => void;
  handleBack: () => void;

}

export default function OnboardingNavigation({
  currentStep,
  totalSteps,
  isStepValid,
  isSubmitting,
  user,
  student,
  handleNext,
  handleBack,

}: OnboardingNavigationProps) {
  // Hide navigation for step 8 (EmailStep) since it has its own submit button
  if (!user && currentStep === 8) {
    return null;
  }

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-10">
      <div className="flex justify-between items-center max-w-2xl mx-auto gap-3">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2 px-3 sm:px-6 h-11 border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={handleNext}
          disabled={!isStepValid || isSubmitting}
          className={`px-4 sm:px-8 font-semibold h-11 flex-1 sm:flex-none text-sm sm:text-base ${
            currentStep === totalSteps
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-900 hover:bg-black text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting
            ? "Saving..."
            : currentStep === totalSteps
            ? user && student
              ? "Update Profile"
              : "Complete Profile"
            : "Continue"}
        </Button>
      </div>
    </div>
  );
} 