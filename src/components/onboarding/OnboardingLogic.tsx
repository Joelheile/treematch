"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { moveAvatarAfterLogin } from "@/integrations/supabase/moveAvatarAfterLogin";
import { useAddSkill } from "@/integrations/supabase/useAddSkill";
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

  const { user, signInWithMagicLink, isNewUser } = useAuth();
  const { student, isLoading: studentLoading } = useCurrentStudent();
  const { data: allSkills = [], isLoading: skillsLoading } = useSkills();

  const availableSkills = useMemo(() => allSkills.filter((skill) => skill.is_global), [allSkills]);
  const suggestedSkills = useMemo(() => allSkills.filter((skill) => !skill.is_global), [allSkills]);
  const updateStudentSkills = useUpdateStudentSkills();
  const { data: studentSkills = [], isLoading: studentSkillsLoading } = useStudentSkills(student?.id);
  const updateStudent = useUpdateStudent();
  const uploadAvatar = useUploadAvatar();
  const addSkill = useAddSkill();

  console.log('[OnboardingLogic] Component render', { 
    user: !!user, 
    userId: user?.id,
    student: !!student, 
    studentId: student?.id,
    studentLoading,
    studentSkillsLoading,
    studentSkills: studentSkills.length,
    isNewUser
  });

  const [suggestedSkill, setSuggestedSkill] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    country: "",
    university: "",
    phoneNumber: "",
    profileImage: "",
    skillIds: [],
    courses: [],
    summerGoals: "",
    coolestThing: "",
    linkedinUrl: "",
    instagramHandle: "",
    twitterHandle: "",
    githubUsername: "",
    websiteUrl: "",
    icon: "",
    email: "",
  });
  const [countryInput, setCountryInput] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tempAvatarPath, setTempAvatarPath] = useState<string>("");

  // 1. On mount, if user is authenticated, check DB profile completeness
  useEffect(() => {
    console.log('[OnboardingLogic] Effect 1 - Loading user data', { 
      user: !!user, 
      student: !!student, 
      studentLoading, 
      studentSkillsLoading,
      studentSkills: studentSkills.length 
    });
    
    if (user && student && !studentLoading && !studentSkillsLoading) {
      console.log('[OnboardingLogic] User and student data available', { 
        student: {
          name: student.name,
          country: student.country,
          university: student.university,
          phone_number: student.phone_number,
          isOnboarded: student.isOnboarded
        },
        studentSkills: studentSkills.length
      });

      // Always prefill formData from DB for edit page (don't redirect)
      const currentSkillIds = studentSkills.map((ss) => ss.skill_id);
      const newFormData = {
        name: student.name || "",
        country: student.country || "",
        university: student.university || "",
        phoneNumber: student.phone_number || "",
        profileImage: student.profile_image || "",
        skillIds: currentSkillIds,
        courses: student.courses || [],
        summerGoals: student.goals || "",
        coolestThing: student.coolest_thing || "",
        linkedinUrl: student.linkedin || "",
        instagramHandle: student.instagram || "",
        twitterHandle: student.twitter || "",
        githubUsername: student.github || "",
        websiteUrl: student.website || "",
        icon: student.icon || "",
        email: user.email || "",
      };
      
      console.log('[OnboardingLogic] Setting form data from DB', newFormData);
      setFormData(newFormData);
      
      if (student.country) {
        setCountryInput(student.country);
        const matchingCountry = countriesData.find((country) => country.name.toLowerCase() === student.country?.toLowerCase());
        if (matchingCountry) {
          console.log('[OnboardingLogic] Setting selected country', matchingCountry);
          setSelectedCountry(matchingCountry);
        }
      }
    }
  }, [user, student, studentLoading, studentSkills, studentSkillsLoading]);

  // 2. On mount, if not authenticated, prefill from localStorage if available
  useEffect(() => {
    if (!user && !student && !studentLoading) {
      const savedData = OnboardingStorage.load();
      if (savedData) {
        setFormData({
          name: savedData.name || "",
          country: savedData.country || "",
          university: savedData.university || "",
          phoneNumber: savedData.phoneNumber || "",
          profileImage: savedData.profileImage || "",
          skillIds: savedData.skillIds || [],
          courses: savedData.courses || [],
          summerGoals: savedData.summerGoals || "",
          coolestThing: savedData.coolestThing || "",
          linkedinUrl: savedData.linkedinUrl || "",
          instagramHandle: savedData.instagramHandle || "",
          twitterHandle: savedData.twitterHandle || "",
          githubUsername: savedData.githubUsername || "",
          websiteUrl: savedData.websiteUrl || "",
          icon: savedData.icon || "",
          email: savedData.email || "",
        });
        if (savedData.country) {
          setCountryInput(savedData.country);
          const matchingCountry = countriesData.find((country) => country.name.toLowerCase() === savedData.country?.toLowerCase());
          if (matchingCountry) setSelectedCountry(matchingCountry);
        }
      }
    }
  }, [user, student, studentLoading]);

  // 3. Always save formData to localStorage on change (with timestamp)
  useEffect(() => {
    if (formData.name || formData.country || formData.university || formData.phoneNumber) {
      const onboardingData: OnboardingData = {
        ...formData,
        tempAvatarPath,
      };
      OnboardingStorage.save(onboardingData);
    }
  }, [formData, tempAvatarPath]);

  // 4. Handle magic link send
  const handleSendMagicLink = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const onboardingData: OnboardingData = {
        ...formData,
        tempAvatarPath,
      };
      OnboardingStorage.save(onboardingData);
      await signInWithMagicLink(formData.email, true);
      toast.success("Check your email for a magic link to complete your signup!");
      setCurrentStep(1); // Optionally reset to first step
    } catch (error) {
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tempAvatarPath, signInWithMagicLink]);

  // 5. Onboarding steps
  const steps = user
    ? [
        { number: 1, title: "Welcome", subtitle: "Basic Information" },
        { number: 2, title: "Skills", subtitle: "Your Expertise" },
        { number: 3, title: "Courses", subtitle: "Your Academic Background" },
        { number: 4, title: "Coolest Thing", subtitle: "What You're Most Proud Of" },
        { number: 5, title: "Goals", subtitle: "Your Aspirations" },
        { number: 6, title: "Connect", subtitle: "Social Links" },
        { number: 7, title: "Photo", subtitle: "Profile Picture" },
      ]
    : [
        { number: 1, title: "Welcome", subtitle: "Basic Information" },
        { number: 2, title: "Skills", subtitle: "Your Expertise" },
        { number: 3, title: "Courses", subtitle: "Your Academic Background" },
        { number: 4, title: "Coolest Thing", subtitle: "What You're Most Proud Of" },
        { number: 5, title: "Goals", subtitle: "Your Aspirations" },
        { number: 6, title: "Connect", subtitle: "Social Links" },
        { number: 7, title: "Photo", subtitle: "Profile Picture" },
        { number: 8, title: "Email", subtitle: "Complete Your Profile" },
      ];

  // 6. Complete profile handler
  const handleCompleteProfile = useCallback(async () => {
    if (!user || !student) return;
    
    setIsSubmitting(true);
    try {
      // Move avatar from temp to permanent location if needed
      let finalAvatarUrl = formData.profileImage;
      if (tempAvatarPath && formData.profileImage) {
        try {
          const result = await moveAvatarAfterLogin(tempAvatarPath, user.id);
          if (result) {
            finalAvatarUrl = result;
          }
        } catch (error) {
          console.error("Error moving avatar:", error);
        }
      }

      // Update student profile
      await updateStudent.mutateAsync({
        id: user.id,
        updates: {
          name: formData.name,
          country: formData.country,
          university: formData.university,
          phone_number: formData.phoneNumber,
          profile_image: finalAvatarUrl,
          courses: formData.courses,
          goals: formData.summerGoals,
          coolest_thing: formData.coolestThing,
          linkedin: formData.linkedinUrl,
          instagram: formData.instagramHandle,
          twitter: formData.twitterHandle,
          github: formData.githubUsername,
          website: formData.websiteUrl,
          icon: formData.icon,
          isOnboarded: true,
        },
      });

      // Update student skills
      if (formData.skillIds.length > 0) {
        await updateStudentSkills.mutateAsync({
          studentId: user.id,
          skillIds: formData.skillIds,
        });
      }

      // Add suggested skills if any
      if (suggestedSkill.trim()) {
        try {
          const newSkill = await addSkill.mutateAsync({
            name: suggestedSkill.trim(),
            is_global: false,
          });
          if (newSkill) {
            await updateStudentSkills.mutateAsync({
              studentId: user.id,
              skillIds: [...formData.skillIds, newSkill.id],
            });
          }
        } catch (error) {
          console.error("Error adding suggested skill:", error);
        }
      }

      // Clear onboarding data from localStorage
      OnboardingStorage.clear();

      // Show success message
      toast.success("Profile completed successfully!");

      // Redirect to main app
      router.push("/");
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Failed to complete profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user,
    student,
    formData,
    tempAvatarPath,
    suggestedSkill,
    updateStudent,
    updateStudentSkills,
    addSkill,
    router,
  ]);

  // 7. Navigation logic
  const handleNext = useCallback(() => {
    const maxStep = user ? 7 : 8;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    } else if (user && currentStep === 7) {
      // Complete profile for authenticated users
      handleCompleteProfile();
    } else if (!user && currentStep === 8) {
      handleSendMagicLink();
    }
  }, [currentStep, user, handleCompleteProfile, handleSendMagicLink]);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // 7. Step validation logic (unchanged)
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
        return formData.coolestThing.trim() !== "";
      case 5:
        return formData.summerGoals.trim() !== "";
      case 6:
        return true;
      case 7:
        return formData.profileImage.trim() !== "" && !isUploadingImage;
      case 8:
        return (
          !user &&
          formData.email.trim() !== "" &&
          formData.email.endsWith("@stanford.edu")
        );
      default:
        return false;
    }
  };

  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
    setCountryInput(country.name);
    setFormData((prev) => ({ ...prev, country: country.name }));
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const result = await uploadAvatar.mutateAsync({ file });
      setFormData((prev) => ({ ...prev, profileImage: result.url }));
      setTempAvatarPath(result.path);
      toast.success("Profile photo uploaded!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadAvatar]);

  // 8. Render onboarding UI
  // Show loading state while fetching user data
  if (user && (studentLoading || studentSkillsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
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
      countrySuggestions={countriesData.filter((country) => country.name.toLowerCase().includes(countryInput.toLowerCase())).slice(0, 5)}
      availableSkills={availableSkills}
      suggestedSkills={suggestedSkills}
      skillsLoading={skillsLoading}
      firstName={formData.name.split(" ")[0] || ""}
      lastName={formData.name.split(" ").slice(1).join(" ") || ""}
      progressPercentage={((currentStep - 1) / (steps.length - 1)) * 100}
      isStepValid={isStepValid()}
      isSubmitting={isSubmitting}
      isUploadingImage={isUploadingImage}
      user={user}
      student={student}
      handleCountryInputChange={setCountryInput}
      handleCountrySelect={handleCountrySelect}
      handleNameChange={(field, value) => {
        if (field === "first") {
          setFormData((prev) => ({ ...prev, name: value + (formData.name.split(" ").slice(1).join(" ") ? " " + formData.name.split(" ").slice(1).join(" ") : "") }));
        } else {
          setFormData((prev) => ({ ...prev, name: (formData.name.split(" ")[0] || "") + " " + value }));
        }
      }}
      handleImageUpload={handleImageUpload}
      handleSuggestSkill={() => {}}
      suggestedSkill={suggestedSkill}
      setSuggestedSkill={setSuggestedSkill}
      handleNext={handleNext}
      handleBack={handleBack}
      handleEmailMagicLink={handleSendMagicLink}
      setShowCountrySuggestions={setShowCountrySuggestions}
    />
  );
}
