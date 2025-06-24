"use client";

import OnboardingSidebar from "./OnboardingSidebar";
import OnboardingNavigation from "./OnboardingNavigation";
import {
  BasicInfoStep,
  SkillsStep,
  CurrentProjectStep,
  GoalsStep,
  SocialsStep,
  ProfilePhotoStep,
} from "./steps";
import { FormData, Skill, Country, Step } from "./types";

interface OnboardingUIProps {
  currentStep: number;
  steps: Step[];
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  countryInput: string;
  showCountrySuggestions: boolean;
  selectedCountry: Country | null;
  countrySuggestions: Country[];
  availableSkills: Skill[];
  skillsLoading: boolean;
  firstName: string;
  lastName: string;
  progressPercentage: number;
  isStepValid: boolean;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  user: any;
  student: any;
  handleCountryInputChange: (value: string) => void;
  handleCountrySelect: (country: Country) => void;
  handleNameChange: (field: "first" | "last", value: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
  handleBack: () => void;
  setShowCountrySuggestions: (show: boolean) => void;
}

export default function OnboardingUI({
  currentStep,
  steps,
  formData,
  setFormData,
  countryInput,
  showCountrySuggestions,
  selectedCountry,
  countrySuggestions,
  availableSkills,
  skillsLoading,
  firstName,
  lastName,
  progressPercentage,
  isStepValid,
  isSubmitting,
  isUploadingImage,
  user,
  student,
  handleCountryInputChange,
  handleCountrySelect,
  handleNameChange,
  handleImageUpload,
  handleNext,
  handleBack,
  setShowCountrySuggestions,
}: OnboardingUIProps) {
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
            countryInput={countryInput}
            showCountrySuggestions={showCountrySuggestions}
            selectedCountry={selectedCountry}
            countrySuggestions={countrySuggestions}
            firstName={firstName}
            lastName={lastName}
            user={user}
            student={student}
            handleCountryInputChange={handleCountryInputChange}
            handleCountrySelect={handleCountrySelect}
            handleNameChange={handleNameChange}
            setShowCountrySuggestions={setShowCountrySuggestions}
          />
        );

      case 2:
        return (
          <SkillsStep
            formData={formData}
            setFormData={setFormData}
            availableSkills={availableSkills}
            skillsLoading={skillsLoading}
          />
        );

      case 3:
        return (
          <CurrentProjectStep
            formData={formData}
            setFormData={setFormData}
          />
        );

      case 4:
        return (
          <GoalsStep
            formData={formData}
            setFormData={setFormData}
          />
        );

      case 5:
        return (
          <SocialsStep
            formData={formData}
            setFormData={setFormData}
          />
        );

      case 6:
        return (
          <ProfilePhotoStep
            formData={formData}
            setFormData={setFormData}
            isUploadingImage={isUploadingImage}
            user={user}
            student={student}
            handleImageUpload={handleImageUpload}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      <OnboardingSidebar 
        currentStep={currentStep}
        steps={steps}
        progressPercentage={progressPercentage}
        isMobile={true}
      />
      <OnboardingSidebar 
        currentStep={currentStep}
        steps={steps}
        progressPercentage={progressPercentage}
        isMobile={false}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div
            className={`max-w-2xl mx-auto h-full ${
              currentStep === 2
                ? "p-4 sm:p-6 lg:p-8 pb-24 flex flex-col"
                : "p-4 sm:p-6 lg:p-8 pb-24"
            }`}
          >
            {renderStepContent()}
          </div>
        </div>

        <OnboardingNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isStepValid={isStepValid}
          isSubmitting={isSubmitting}
          user={user}
          student={student}
          handleNext={handleNext}
          handleBack={handleBack}
        />
      </div>
    </div>
  );
}
