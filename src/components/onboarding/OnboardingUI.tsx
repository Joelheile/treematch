"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  Briefcase,
  Check,
  ChevronLeft,
  Github,
  Instagram,
  Linkedin,
  Target,
  TreePine,
  Twitter,
  User,
  Users,
} from "lucide-react";

const countryToFlag = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

interface FormData {
  name: string;
  country: string;
  university: string;
  phoneNumber: string;
  profileImage: string;
  skillIds: string[];
  summerGoals: string;
  currentProject: string;
  linkedinUrl: string;
  instagramHandle: string;
  twitterHandle: string;
  githubUsername: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Country {
  name: string;
  code: string;
}

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
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                {user && student
                  ? "Update Your Profile"
                  : "Welcome to Treematch!"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4 px-2">
                {user && student
                  ? "Review and update your profile information."
                  : "Connect with fellow students for projects, collaboration, and friendship."}
              </p>
              <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm px-2">
                {user && student
                  ? "Make sure your information is up to date."
                  : "Let's start with some basic information to build your profile."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    First Name*
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => handleNameChange("first", e.target.value)}
                    placeholder="First Name"
                    className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    Last Name*
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => handleNameChange("last", e.target.value)}
                    placeholder="Last Name"
                    className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="university"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Home University*
                </Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  placeholder="Oxford, Technical University Munich, etc."
                  className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                />
              </div>

              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Phone Number*
                </Label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(phone) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: phone,
                    }))
                  }
                  inputClassName="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base w-full"
                  className="w-full"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="relative">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Country*
                </Label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="country"
                      value={countryInput}
                      onChange={(e) => handleCountryInputChange(e.target.value)}
                      onFocus={() =>
                        setShowCountrySuggestions(countryInput.length > 0)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowCountrySuggestions(false), 200)
                      }
                      placeholder="Start typing your country..."
                      className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                      autoComplete="off"
                    />

                    {showCountrySuggestions &&
                      countrySuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto">
                          {countrySuggestions.map((country) => (
                            <div
                              key={country.code}
                              className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                              onClick={() => handleCountrySelect(country)}
                            >
                              <span className="text-base sm:text-lg">
                                {countryToFlag(country.code)}
                              </span>
                              <span className="text-gray-900">
                                {country.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {selectedCountry && (
                    <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gray-50 rounded-md border border-gray-200">
                      <span className="text-xl sm:text-2xl">
                        {countryToFlag(selectedCountry.code)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                What are your skills?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
                Select the areas where you have experience or expertise. This
                helps others find you for the right projects.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border-b border-gray-200" />
              {skillsLoading ? (
                <div className="text-center text-gray-500 py-8">
                  Loading skills...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3 max-h-80 overflow-y-auto px-1">
                  {availableSkills.map((skill) => {
                    const isSelected = formData.skillIds.includes(skill.id);
                    return (
                      <Badge
                        key={skill.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer text-center justify-center py-2 px-3 text-xs sm:text-sm transition-all hover:scale-105 min-h-[36px] sm:min-h-[40px] touch-manipulation ${
                          isSelected
                            ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                            : "hover:bg-red-50 hover:border-red-200 border-gray-300"
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            skillIds: isSelected
                              ? prev.skillIds.filter((id) => id !== skill.id)
                              : [...prev.skillIds, skill.id],
                          }));
                        }}
                      >
                        {skill.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
                What's the coolest passion/project/thing you've done/have?
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
                This is your chance to showcase what makes you unique! Share
                something you're proud of - whether it's a current project, past
                achievement, hobby, or passion. Think of something that would
                spark an interesting conversation :)
              </p>
            </div>

            <div>
              <Label
                htmlFor="currentProject"
                className="text-base sm:text-lg font-semibold text-gray-700 mb-2 block"
              >
                Your Coolest Thing*
              </Label>
              <Textarea
                id="currentProject"
                value={formData.currentProject}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentProject: e.target.value,
                  }))
                }
                placeholder="Tell us about something awesome you've done or are working on..."
                className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
              />
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <strong>Examples:</strong> Built a viral TikTok channel,
                  started a startup, part of Excel world championship, built a
                  community event, etc.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
                What do you hope to achieve this semester?*
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
                Tell others about what you want to achieve? Build something,
                meet VCs, get inspired, learn a new skill, etc.
              </p>
            </div>

            <div>
              <Textarea
                id="goals"
                value={formData.summerGoals}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    summerGoals: e.target.value,
                  }))
                }
                placeholder="e.g., Launch my startup, complete my CS thesis, find an internship, build my network, learn new skills..."
                className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                Connect with You
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
                Share your social media links so others can connect with you
                outside of Treematch.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="linkedinUrl"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedinUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.linkedin.com/in/yourusername"
                  className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div>
                <Label
                  htmlFor="instagramHandle"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  id="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instagramHandle: e.target.value,
                    }))
                  }
                  placeholder="@username"
                  className="h-11 sm:h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-base"
                />
              </div>

              <div>
                <Label
                  htmlFor="twitterHandle"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter / X
                </Label>
                <Input
                  id="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      twitterHandle: e.target.value,
                    }))
                  }
                  placeholder="@username"
                  className="h-11 sm:h-12 border-gray-300 focus:border-blue-400 focus:ring-blue-400 text-base"
                />
              </div>

              <div>
                <Label
                  htmlFor="githubUsername"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
                >
                  <Github className="w-4 h-4 text-gray-800" />
                  GitHub
                </Label>
                <Input
                  id="githubUsername"
                  value={formData.githubUsername}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      githubUsername: e.target.value,
                    }))
                  }
                  placeholder="@username"
                  className="h-11 sm:h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-base"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                Add Your Profile Photo*
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
                Upload a ✨friendly ✨ photo so others can recognize you around
                campus. We have over 500 students and there's no way to match
                anybody without a photo haha.
              </p>

              {formData.profileImage ? (
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-red-100 mx-auto"
                  />
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, profileImage: "" }))
                      }
                      className="h-11 text-sm sm:text-base"
                    >
                      Remove Photo
                    </Button>
                    <Label
                      htmlFor="image-upload-change"
                      className="cursor-pointer"
                    >
                      <Button
                        variant="outline"
                        asChild
                        className="h-11 text-sm sm:text-base"
                        disabled={isUploadingImage}
                      >
                        <span>
                          {isUploadingImage ? "Uploading..." : "Change Photo"}
                        </span>
                      </Button>
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-change"
                      disabled={isUploadingImage}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImage}
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      asChild
                      disabled={isUploadingImage}
                    >
                      <span>
                        {isUploadingImage ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    JPG, PNG or GIF • Max 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepsWithIcons = steps.map((step) => {
    const icons = [TreePine, Target, Briefcase, Check, Users, User];
    return {
      ...step,
      icon: icons[step.number - 1],
      completed: currentStep > step.number,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      <div className="lg:hidden bg-white border-b border-gray-200 p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-red-600 p-1.5 sm:p-2 rounded-lg">
              <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              Treematch
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {currentStep} of {steps.length}
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={progressPercentage}
            className="h-2 [&>div]:bg-red-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span className="truncate pr-2">
              {steps[currentStep - 1]?.title}
            </span>
            <span className="flex-shrink-0">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-80 xl:w-96 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
        <div className="p-6 w-full">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-red-600 p-2 rounded-lg">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Treematch</div>
          </div>

          <div className="space-y-1">
            {stepsWithIcons.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    step.number === currentStep
                      ? "bg-red-50 border border-red-200"
                      : step.completed
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      step.number === currentStep
                        ? "bg-red-600 text-white"
                        : step.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
            {renderStepContent()}
          </div>
        </div>

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
              disabled={!isStepValid}
              className={`px-4 sm:px-8 font-semibold h-11 flex-1 sm:flex-none text-sm sm:text-base ${
                currentStep === 6
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-900 hover:bg-black text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting
                ? "Saving..."
                : currentStep === 6
                ? user && student
                  ? "Update Profile"
                  : "Complete Profile"
                : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
