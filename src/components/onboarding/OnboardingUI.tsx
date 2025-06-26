"use client";

import OnboardingNavigation from "./OnboardingNavigation";
import OnboardingSidebar from "./OnboardingSidebar";
import {
  BasicInfoStep,
  CoursesStep,
  CurrentProjectStep,
  GoalsStep,
  ProfilePhotoStep,
  SkillsStep,
  SocialsStep,
} from "./steps";
import { EmailStep } from "./steps/EmailStep";
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
  handleSuggestSkill: () => void;
  suggestedSkill: string;
  setSuggestedSkill: (value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleEmailMagicLink: () => void;
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
  suggestedSkills,
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
  handleSuggestSkill,
  suggestedSkill,
  setSuggestedSkill,
  handleNext,
  handleBack,
  handleEmailMagicLink,
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
          <CurrentProjectStep formData={formData} setFormData={setFormData} />
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
            user={user}
            student={student}
            handleImageUpload={handleImageUpload}
          />
        );

      case 8:
        return !user ? (
          <EmailStep
            email={formData.email}
            setEmail={(email) => setFormData(prev => ({ ...prev, email }))}
          />
        ) : null;

      default:
        return null;
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
          handleEmailMagicLink={handleEmailMagicLink}
        />
      </div>
    </div>
  );
}
