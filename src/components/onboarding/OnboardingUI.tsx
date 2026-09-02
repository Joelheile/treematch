"use client";

import OnboardingNavigation from "./OnboardingNavigation";
import type { User } from "@supabase/supabase-js";
import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import OnboardingSidebar from "./OnboardingSidebar";
import {
  BasicInfoStep,
  CoursesStep,
  CoolestThingStep,
  GoalsStep,
  ProfilePhotoStep,
  SkillsStep,
  SocialsStep,
  EmailStep,
} from "./steps";
import { Country, FormData, Skill, Step } from "./types";

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
  suggestedSkills: Skill[];
  skillsLoading: boolean;
  name: string;
  progressPercentage: number;
  isStepValid: boolean;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  user: User | null;
  student?: StudentWithSkills | null;
  handleCountryInputChange: (value: string) => void;
  handleCountrySelect: (country: Country) => void;
  handleNameChange: (value: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSuggestSkill: () => void;
  suggestedSkill: string;
  setSuggestedSkill: (value: string) => void;
  handleNext: () => void;
  handleBack: () => void;

  setShowCountrySuggestions: (show: boolean) => void;
  onCreateAccount: (email: string, password: string) => Promise<void>;
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
  suggestedSkills,
  skillsLoading,
  name,
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
  handleSuggestSkill,
  suggestedSkill,
  setSuggestedSkill,
  handleNext,
  handleBack,

  setShowCountrySuggestions,
  onCreateAccount,
}: OnboardingUIProps) {

  const renderStepContent = () => {
    if (user) {
      // Authenticated user steps (1-7)
      switch (currentStep) {
        case 1:
          return (
            <BasicInfoStep
              user={user}
              student={student}
              formData={formData}
              setFormData={setFormData}
              countryInput={countryInput}
              showCountrySuggestions={showCountrySuggestions}
              selectedCountry={selectedCountry}
              countrySuggestions={countrySuggestions}
              name={name}
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
              suggestedSkills={suggestedSkills}
              skillsLoading={skillsLoading}
              suggestedSkill={suggestedSkill}
              setSuggestedSkill={setSuggestedSkill}
              handleSuggestSkill={handleSuggestSkill}
            />
          );

        case 3:
          return (
            <CoursesStep
              formData={formData}
              setFormData={setFormData}
              availableCourses={[]}
              coursesLoading={false}
              onNext={handleNext}
            />
          );

        case 4:
          return (
            <CoolestThingStep formData={formData} setFormData={setFormData} />
          );

        case 5:
          return <GoalsStep formData={formData} setFormData={setFormData} />;

        case 6:
          return <SocialsStep formData={formData} setFormData={setFormData} />;

        case 7:
          return (
            <ProfilePhotoStep
              formData={formData}
              setFormData={setFormData}
              isUploadingImage={isUploadingImage}
              handleImageUpload={handleImageUpload}
            />
          );

        default:
          return null;
      }
    } else {
      // Unauthenticated user steps (1-5, skipping coolest thing, goals, social links)
      switch (currentStep) {
        case 1:
          return (
            <BasicInfoStep
              user={user}
              student={student}
              formData={formData}
              setFormData={setFormData}
              countryInput={countryInput}
              showCountrySuggestions={showCountrySuggestions}
              selectedCountry={selectedCountry}
              countrySuggestions={countrySuggestions}
              name={name}
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
              suggestedSkills={suggestedSkills}
              skillsLoading={skillsLoading}
              suggestedSkill={suggestedSkill}
              setSuggestedSkill={setSuggestedSkill}
              handleSuggestSkill={handleSuggestSkill}
            />
          );

        case 3:
          return (
            <CoursesStep
              formData={formData}
              setFormData={setFormData}
              availableCourses={[]}
              coursesLoading={false}
              onNext={handleNext}
            />
          );

        case 4:
          return (
            <ProfilePhotoStep
              formData={formData}
              setFormData={setFormData}
              isUploadingImage={isUploadingImage}
              handleImageUpload={handleImageUpload}
            />
          );

        case 5:
          return (
            <EmailStep
              onCreateAccount={onCreateAccount}
              isSubmitting={isSubmitting}
            />
          );

        default:
          return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
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

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
            <div className={currentStep === 2 ? "h-full flex flex-col" : ""}>
              {renderStepContent()}
            </div>
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
