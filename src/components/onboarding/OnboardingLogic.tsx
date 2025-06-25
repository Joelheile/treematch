"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { moveAvatarAfterLogin } from "@/integrations/supabase/moveAvatarAfterLogin";
import { useSkills } from "@/integrations/supabase/useSkills";
import {
  useStudentSkills,
  useUpdateStudentSkills,
} from "@/integrations/supabase/useStudentSkills";
import { useUpdateStudent } from "@/integrations/supabase/useUpdateStudent";
import { useUploadAvatar } from "@/integrations/supabase/useUploadAvatar";
import countriesData from "@/lib/countries.json";
import {
  OnboardingStorage,
  type OnboardingData,
} from "@/lib/onboarding-storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import OnboardingUI from "./OnboardingUI";
import { FormData } from "./types";

export default function OnboardingLogic() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { user, signInWithMagicLink } = useAuth();
  const { student, isLoading: studentLoading } = useCurrentStudent();
  const { data: availableSkills = [], isLoading: skillsLoading } = useSkills();
  const updateStudentSkills = useUpdateStudentSkills();
  const { data: studentSkills = [] } = useStudentSkills(student?.id);
  const updateStudent = useUpdateStudent();
  const uploadAvatar = useUploadAvatar();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    country: "",
    university: "",
    phoneNumber: "",
    profileImage: "",
    skillIds: [],
    courses: [],
    summerGoals: "",
    currentProject: "",
    linkedinUrl: "",
    instagramHandle: "",
    twitterHandle: "",
    githubUsername: "",
    websiteUrl: "",
    icon: "",
  });

  const [countryInput, setCountryInput] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tempAvatarPath, setTempAvatarPath] = useState<string>("");

  useEffect(() => {
    if (student) {
      // Get current student's skill IDs from junction table
      const currentSkillIds = studentSkills.map((ss) => ss.skill_id);

      // Get social media from localStorage (not in DB yet)
      const savedData = OnboardingStorage.load();

      setFormData({
        name: student.name || "",
        email: student.email || "",
        country: student.country || "",
        university: student.university || "",
        phoneNumber: student.phone_number || "",
        profileImage: student.profile_image || "",
        skillIds: currentSkillIds,
        courses: student.courses || [],
        summerGoals: student.goals || "",
        currentProject: student.current_project || "",
        linkedinUrl: student.linkedin || "",
        instagramHandle: student.instagram || "",
        twitterHandle: student.twitter || "",
        githubUsername: student.github || "",
        websiteUrl: student.website || "",
        icon: student.icon || "",
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
          email: savedData.email || "",
          country: savedData.country || "",
          university: savedData.university || "",
          phoneNumber: savedData.phoneNumber || "",
          profileImage: savedData.profileImage || "",
          skillIds: savedData.skillIds || [],
          courses: savedData.courses || (savedData as any).courseIds || [],
          summerGoals: savedData.summerGoals || "",
          currentProject: savedData.currentProject || "",
          linkedinUrl: savedData.linkedinUrl || "",
          instagramHandle: savedData.instagramHandle || "",
          twitterHandle: savedData.twitterHandle || "",
          githubUsername: savedData.githubUsername || "",
          websiteUrl: savedData.websiteUrl || "",
          icon: savedData.icon || "",
        });
      }
    }
  }, [student, availableSkills, studentLoading, studentSkills]);

  const steps = [
    { number: 1, title: "Welcome", subtitle: "Basic Information" },
    { number: 2, title: "Skills", subtitle: "Your Expertise" },
    { number: 3, title: "Courses", subtitle: "Your Academic Background" },
    { number: 4, title: "Projects", subtitle: "What You're Working On" },
    { number: 5, title: "Goals", subtitle: "Your Aspirations" },
    { number: 6, title: "Connect", subtitle: "Social Links" },
    { number: 7, title: "Photo", subtitle: "Profile Picture" },
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
      if (!file) return;
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
        const result = await uploadAvatar.mutateAsync({ file });
        setFormData((prev) => ({ ...prev, profileImage: result.url }));
        setTempAvatarPath(result.path);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [uploadAvatar]
  );

  const handleCompleteProfile = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (user && student) {
        let newProfileImage = formData.profileImage;
        if (tempAvatarPath) {
          newProfileImage = await moveAvatarAfterLogin(tempAvatarPath, user.id);
        }
        // Update skills using proper junction tablee
        await updateStudentSkills.mutateAsync({
          studentId: student.id,
          skillIds: formData.skillIds,
        });

        await updateStudent.mutateAsync({
          id: student.id,
          updates: {
            name: formData.name,
            country: formData.country,
            university: formData.university || null,
            phone_number: formData.phoneNumber || null,
            profile_image: newProfileImage || null,
            current_project: formData.currentProject || null,
            coolest_thing: formData.currentProject || null,
            goals: formData.summerGoals || null,

            courses: formData.courses,
            linkedin: formData.linkedinUrl || null,
            github: formData.githubUsername || null,
            website: formData.websiteUrl || null,
            isOnboarded: true,
            instagram: formData.instagramHandle || null,
            twitter: formData.twitterHandle || null,
          },
        });

        // Also save current form data to localStorage for fields not in database
        const currentFormAsLocalStorage: OnboardingData = {
          name: formData.name,
          email: formData.email,
          country: formData.country,
          university: formData.university,
          phoneNumber: formData.phoneNumber,
          profileImage: formData.profileImage,
          skillIds: formData.skillIds,
          courses: formData.courses,
          summerGoals: formData.summerGoals,
          currentProject: formData.currentProject,
          linkedinUrl: formData.linkedinUrl,
          instagramHandle: formData.instagramHandle,
          twitterHandle: formData.twitterHandle,
          githubUsername: formData.githubUsername,
          websiteUrl: formData.websiteUrl,
          icon: formData.icon,
        };

        OnboardingStorage.save(currentFormAsLocalStorage);

        toast.success("Your profile has been updated successfully!");
        router.push("/");
        return;
      }
      const onboardingData: OnboardingData = {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        university: formData.university,
        phoneNumber: formData.phoneNumber,
        profileImage: formData.profileImage,
        skillIds: formData.skillIds,
        courses: formData.courses,
        summerGoals: formData.summerGoals,
        currentProject: formData.currentProject,
        linkedinUrl: formData.linkedinUrl,
        instagramHandle: formData.instagramHandle,
        twitterHandle: formData.twitterHandle,
        githubUsername: formData.githubUsername,
        websiteUrl: formData.websiteUrl,
        tempAvatarPath,
        icon: formData.icon,
      };
      OnboardingStorage.save(onboardingData);
      await signInWithMagicLink(formData.email);
      toast.success(
        "Check your email for a magic link to complete your signup!"
      );
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user,
    student,
    formData,
    tempAvatarPath,
    updateStudent,
    updateStudentSkills,
    router,
    signInWithMagicLink,
  ]);

  const handleNext = useCallback(() => {
    if (currentStep < 7) {
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
          formData.email.trim() !== "" &&
          formData.country.trim() !== "" &&
          formData.university.trim() !== "" &&
          formData.phoneNumber.trim() !== ""
        );
      case 2:
        return formData.skillIds.length > 0;
      case 3:
        return true;
      case 4:
        return formData.currentProject.trim() !== "";
      case 5:
        return formData.summerGoals.trim() !== "";
      case 6:
        return true;
      case 7:
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
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 flex items-center justify-center animate-pulse">
            <Image
              src="/icon.png"
              alt="TreeMatch"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <p className="text-sm text-gray-500">
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
