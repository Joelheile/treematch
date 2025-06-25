"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { useSkills } from "@/integrations/supabase/useSkills";
import { useUpdateStudent } from "@/integrations/supabase/useUpdateStudent";
import { useUpdateStudentSkills } from "@/integrations/supabase/useUpdateStudentSkills";
import { useUploadAvatar } from "@/integrations/supabase/useUploadAvatar";
import { moveAvatarAfterLogin } from "@/integrations/supabase/moveAvatarAfterLogin";
import countriesData from "@/lib/countries.json";
import {
  OnboardingStorage,
  type OnboardingData,
} from "@/lib/onboarding-storage";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import OnboardingUI from "./OnboardingUI";
import { FormData } from "./types";
import { TreePine } from "lucide-react";

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '').substring(0, 500)
}

const validateUrl = (url: string): boolean => {
  if (!url.trim()) return true
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone.trim()) return true
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
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
    phoneNumber: "",
    profileImage: "",
    skillIds: [],
    courseIds: [],
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
  const [tempAvatarPath, setTempAvatarPath] = useState<string>("");

  useEffect(() => {
    if (student && availableSkills.length > 0) {
      setFormData({
        name: student.name || "",
        country: student.country || "",
        university: "",
        phoneNumber: student.phone_number || "",
        profileImage: student.profile_image || "",
        skillIds: student.skills || [],
        courseIds: [],
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
          phoneNumber: savedData.phoneNumber || "",
          profileImage: savedData.profileImage || "",
          skillIds: savedData.skillIds || [],
          courseIds: savedData.courseIds || [],
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
    const sanitizedValue = sanitizeInput(value)
    setCountryInput(sanitizedValue);
    setShowCountrySuggestions(sanitizedValue.length > 0);

    const exactMatch = countriesData.find(
      (country) => country.name.toLowerCase() === sanitizedValue.toLowerCase()
    );

    if (exactMatch) {
      setSelectedCountry(exactMatch);
      setFormData((prev) => ({ ...prev, country: exactMatch.name }));
    } else {
      setSelectedCountry(null);
      setFormData((prev) => ({ ...prev, country: sanitizedValue }));
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
      
      console.log('Starting image upload for user:', user?.id, 'file:', file.name);
      setIsUploadingImage(true);
      try {
        const result = await uploadAvatar.mutateAsync({ 
          file, 
          userId: user?.id 
        });
        console.log('Upload result:', result);
        setFormData((prev) => ({ ...prev, profileImage: result.url }));
        if (!user?.id) {
          setTempAvatarPath(result.path);
          console.log('Set temp avatar path:', result.path);
        } else {
          console.log('Avatar uploaded directly to permanent location');
        }
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error('Upload error:', error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [uploadAvatar, user?.id]
  );

  const handleCompleteProfile = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (user && student) {
        let newProfileImage = formData.profileImage;
        console.log('Completing profile with tempAvatarPath:', tempAvatarPath, 'user.id:', user.id);
        if (tempAvatarPath && user.id) {
          console.log('Moving avatar from temp to permanent location');
          newProfileImage = await moveAvatarAfterLogin(tempAvatarPath, user.id);
          console.log('Moved avatar result:', newProfileImage);
        }
        
        const sanitizedUpdates = {
          name: sanitizeInput(formData.name),
          country: sanitizeInput(formData.country),
          phone_number: formData.phoneNumber ? sanitizeInput(formData.phoneNumber) : null,
          profile_image: newProfileImage || null,
          summer_goals: formData.summerGoals ? [sanitizeInput(formData.summerGoals)] : [],
          coolest_thing: sanitizeInput(formData.currentProject),
          linkedin: formData.linkedinUrl ? sanitizeInput(formData.linkedinUrl) : null,
          github: formData.githubUsername ? sanitizeInput(formData.githubUsername) : null,
          website: formData.twitterHandle ? sanitizeInput(formData.twitterHandle) : null,
        }

        console.log('Saving profile with updates:', sanitizedUpdates);

        if (!validateUrl(sanitizedUpdates.linkedin || '')) {
          throw new Error('Invalid LinkedIn URL')
        }
        if (!validateUrl(sanitizedUpdates.github || '')) {
          throw new Error('Invalid GitHub URL')
        }
        if (!validateUrl(sanitizedUpdates.website || '')) {
          throw new Error('Invalid website URL')
        }
        if (!validatePhoneNumber(sanitizedUpdates.phone_number || '')) {
          throw new Error('Invalid phone number')
        }

        await Promise.all([
          updateStudent.mutateAsync({
            id: student.id,
            updates: sanitizedUpdates,
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
        
      const sanitizedOnboardingData: OnboardingData = {
        name: sanitizeInput(formData.name),
        country: sanitizeInput(formData.country),
        university: sanitizeInput(formData.university),
        phoneNumber: sanitizeInput(formData.phoneNumber),
        profileImage: formData.profileImage,
        skills: selectedSkillNames,
        skillIds: formData.skillIds,
        courses: formData.courseIds,
        courseIds: formData.courseIds,
        summerGoals: sanitizeInput(formData.summerGoals),
        currentProject: sanitizeInput(formData.currentProject),
        linkedinUrl: sanitizeInput(formData.linkedinUrl),
        instagramHandle: sanitizeInput(formData.instagramHandle),
        twitterHandle: sanitizeInput(formData.twitterHandle),
        githubUsername: sanitizeInput(formData.githubUsername),
        tempAvatarPath,
      };

      if (!validateUrl(sanitizedOnboardingData.linkedinUrl)) {
        throw new Error('Invalid LinkedIn URL')
      }
      if (!validateUrl(sanitizedOnboardingData.githubUsername)) {
        throw new Error('Invalid GitHub URL')
      }
      if (!validateUrl(sanitizedOnboardingData.twitterHandle)) {
        throw new Error('Invalid Twitter URL')
      }
      if (!validatePhoneNumber(sanitizedOnboardingData.phoneNumber)) {
        throw new Error('Invalid phone number')
      }

      OnboardingStorage.save(sanitizedOnboardingData);
      toast.success(
        "Profile information saved! Now let's create your account."
      );
      router.push("/auth/signup");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile. Please try again.");
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
    availableSkills,
    router,
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
    const sanitizedValue = sanitizeInput(value)
    if (field === "first") {
      setFormData((prev) => ({
        ...prev,
        name: lastName ? `${sanitizedValue} ${lastName}` : sanitizedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: firstName ? `${firstName} ${sanitizedValue}` : sanitizedValue,
      }));
    }
  };

  if (studentLoading || skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6 text-white" />
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
