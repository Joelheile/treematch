"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { useSkills } from "@/integrations/supabase/useSkills";
import { useUpdateStudent } from "@/integrations/supabase/useUpdateStudent";
import { useUpdateStudentSkills } from "@/integrations/supabase/useUpdateStudentSkills";
import { useUploadAvatar } from "@/integrations/supabase/useUploadAvatar";
import countriesData from "@/lib/countries.json";
import {
  OnboardingStorage,
  type OnboardingData,
} from "@/lib/onboarding-storage";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import OnboardingUI from "./OnboardingUI";

interface FormData {
  name: string;
  country: string;
  university: string;
  profileImage: string;
  skillIds: string[];
  summerGoals: string;
  currentProject: string;
  linkedinUrl: string;
  instagramHandle: string;
  twitterHandle: string;
  githubUsername: string;
}

export default function OnboardingLogic() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const { student, isLoading: studentLoading } = useCurrentStudent();
  const { data: availableSkills = [], isLoading: skillsLoading } = useSkills();
  const updateStudentSkills = useUpdateStudentSkills();
  const updateStudent = useUpdateStudent();
  const uploadAvatar = useUploadAvatar();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    country: "",
    university: "",
    profileImage: "",
    skillIds: [],
    summerGoals: "",
    currentProject: "",
    linkedinUrl: "",
    instagramHandle: "",
    twitterHandle: "",
    githubUsername: "",
  });

  const [countryInput, setCountryInput] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (student && availableSkills.length > 0) {
      setFormData({
        name: student.name || "",
        country: student.country || "",
        university: "",
        profileImage: student.profile_image || "",
        skillIds: student.skills?.map((skill) => skill.id) || [],
        summerGoals: student.summer_goals?.join("\n") || "",
        currentProject: student.coolest_thing || "",
        linkedinUrl: student.linkedin || "",
        instagramHandle: "",
        twitterHandle: "",
        githubUsername: student.github || "",
      });

      if (student.country) {
        setCountryInput(student.country);
        const matchingCountry = countriesData.find(
          (country) =>
            country.name.toLowerCase() === student.country?.toLowerCase()
        );
        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
        }
      }
    } else if (!studentLoading) {
      const savedData = OnboardingStorage.load();
      if (savedData) {
        setFormData({
          name: savedData.name || "",
          country: savedData.country || "",
          university: savedData.university || "",
          profileImage: savedData.profileImage || "",
          skillIds: savedData.skillIds || [],
          summerGoals: savedData.summerGoals || "",
          currentProject: savedData.currentProject || "",
          linkedinUrl: savedData.linkedinUrl || "",
          instagramHandle: savedData.instagramHandle || "",
          twitterHandle: savedData.twitterHandle || "",
          githubUsername: savedData.githubUsername || "",
        });
      }
    }
  }, [student, availableSkills, studentLoading]);

  const steps = [
    { number: 1, title: "Welcome", subtitle: "Basic Information" },
    { number: 2, title: "Skills", subtitle: "Your Expertise" },
    { number: 3, title: "Current Project", subtitle: "What You're Building" },
    { number: 4, title: "Goals", subtitle: "Your Aspirations" },
    { number: 5, title: "Socials", subtitle: "Connect With You" },
    { number: 6, title: "Profile Photo", subtitle: "Add Your Picture" },
  ];

  const countrySuggestions = countriesData
    .filter((country) =>
      country.name.toLowerCase().includes(countryInput.toLowerCase())
    )
    .slice(0, 5);

  const handleCountryInputChange = (value: string) => {
    setCountryInput(value);
    setShowCountrySuggestions(value.length > 0);

    const exactMatch = countriesData.find(
      (country) => country.name.toLowerCase() === value.toLowerCase()
    );

    if (exactMatch) {
      setSelectedCountry(exactMatch);
      setFormData((prev) => ({ ...prev, country: exactMatch.name }));
    } else {
      setSelectedCountry(null);
      setFormData((prev) => ({ ...prev, country: value }));
    }
  };

  const handleCountrySelect = (country: { name: string; code: string }) => {
    setCountryInput(country.name);
    setSelectedCountry(country);
    setShowCountrySuggestions(false);
    setFormData((prev) => ({ ...prev, country: country.name }));
  };

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, PNG, or GIF)");
        return;
      }

      setIsUploadingImage(true);

      try {
        const result = await uploadAvatar.mutateAsync({
          file,
          userId: user.id,
        });

        setFormData((prev) => ({
          ...prev,
          profileImage: result.url,
        }));

        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [user?.id, uploadAvatar]
  );

  const handleCompleteProfile = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (user && student) {
        await Promise.all([
          updateStudent.mutateAsync({
            id: student.id,
            updates: {
              name: formData.name,
              country: formData.country,
              profile_image: formData.profileImage || null,
              summer_goals: formData.summerGoals ? [formData.summerGoals] : [],
              coolest_thing: formData.currentProject,
              linkedin: formData.linkedinUrl || null,
              github: formData.githubUsername || null,
              website: formData.twitterHandle || null,
            },
          }),
          updateStudentSkills.mutateAsync({
            studentId: student.id,
            skillIds: formData.skillIds,
          }),
        ]);

        toast.success("Your profile has been updated successfully!");
        router.push("/");
        return;
      }

      const selectedSkillNames = availableSkills
        .filter((skill) => formData.skillIds.includes(skill.id))
        .map((skill) => skill.name);

      const onboardingData: OnboardingData = {
        name: formData.name,
        country: formData.country,
        university: formData.university,
        profileImage: formData.profileImage,
        skills: selectedSkillNames,
        skillIds: formData.skillIds,
        summerGoals: formData.summerGoals,
        currentProject: formData.currentProject,
        linkedinUrl: formData.linkedinUrl,
        instagramHandle: formData.instagramHandle,
        twitterHandle: formData.twitterHandle,
        githubUsername: formData.githubUsername,
      };

      OnboardingStorage.save(onboardingData);
      toast.success(
        "Profile information saved! Now let's create your account."
      );
      router.push("/auth/signup");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    router,
    availableSkills,
    user,
    student,
    updateStudentSkills,
    updateStudent,
  ]);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteProfile();
    }
  }, [currentStep, handleCompleteProfile]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim() !== "" &&
          formData.country.trim() !== "" &&
          formData.university.trim() !== ""
        );
      case 2:
        return formData.skillIds.length > 0;
      case 3:
        return formData.currentProject.trim() !== "";
      case 4:
        return formData.summerGoals.trim() !== "";
      case 5:
        return true;
      case 6:
        return formData.profileImage.trim() !== "" && !isUploadingImage;
      default:
        return false;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const { firstName, lastName } = useMemo(() => {
    const parts = formData.name.split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  }, [formData.name]);

  const handleNameChange = (field: "first" | "last", value: string) => {
    if (field === "first") {
      setFormData((prev) => ({
        ...prev,
        name: lastName ? `${value} ${lastName}` : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: firstName ? `${firstName} ${value}` : value,
      }));
    }
  };

  if (studentLoading || skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L13.09 8.26L22 9L13.09 15.74L15.18 22L12 18.5L8.82 22L10.91 15.74L2 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
          <p className="text-gray-600">
            {user ? "Loading your profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingUI
      currentStep={currentStep}
      steps={steps}
      formData={formData}
      setFormData={setFormData}
      countryInput={countryInput}
      showCountrySuggestions={showCountrySuggestions}
      selectedCountry={selectedCountry}
      countrySuggestions={countrySuggestions}
      availableSkills={availableSkills}
      skillsLoading={skillsLoading}
      firstName={firstName}
      lastName={lastName}
      progressPercentage={progressPercentage}
      isStepValid={isStepValid()}
      isSubmitting={isSubmitting}
      isUploadingImage={isUploadingImage}
      user={user}
      student={student}
      handleCountryInputChange={handleCountryInputChange}
      handleCountrySelect={handleCountrySelect}
      handleNameChange={handleNameChange}
      handleImageUpload={handleImageUpload}
      handleNext={handleNext}
      handleBack={handleBack}
      setShowCountrySuggestions={setShowCountrySuggestions}
    />
  );
}
