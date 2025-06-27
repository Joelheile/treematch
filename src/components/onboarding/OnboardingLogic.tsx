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
import { useUploadAvatar, moveImageToAvatarsBucket } from "@/integrations/supabase/useUploadAvatar";
import countriesData from "@/lib/countries.json";
import {
  OnboardingStorage,
  type OnboardingData,
} from "@/lib/onboarding-storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import OnboardingUI from "./OnboardingUI";
import { FormData } from "./types";
import { isValidPhone } from "@/lib/phone-validation";

export default function OnboardingLogic() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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

  // Function to fix profile image URLs that point to temp-avatars
  const fixProfileImageUrl = useCallback(async (student: any) => {
    if (!student?.profile_image || !user?.id) return student.profile_image;
    
    // Check if the image is in temp-avatars bucket but user has complete profile
    if (student.profile_image.includes('/temp-avatars/') && student.isOnboarded) {
      try {
        // Set a timeout to prevent blocking the UI
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), 3000);
        });
        
        // Actually move the image file from temp-avatars to avatars bucket
        const movePromise = moveImageToAvatarsBucket(user.id, student.profile_image);
        
        const movedImageUrl = await Promise.race([movePromise, timeoutPromise]);
        
        if (movedImageUrl) {
          // Update the database with the correct URL (fire and forget)
          updateStudent.mutateAsync({
            id: user.id,
            updates: {
              profile_image: movedImageUrl,
            },
          }).catch(error => {
            console.error('Failed to update profile image in database:', error);
          });
          
          // Update cache immediately
          queryClient.setQueryData(['student-by-user-id', user.id], (oldData: any) => {
            if (oldData?.data) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  profile_image: movedImageUrl
                }
              };
            }
            return oldData;
          });
          
          // Return cache-busted URL for immediate display
          return `${movedImageUrl}?v=${Date.now()}`;
        }
      } catch (error) {
        console.error('Error fixing profile image URL:', error);
        // Return original URL with cache-busting on error
        return `${student.profile_image}?v=${Date.now()}`;
      }
    }
    
    // Add cache-busting to existing URLs if they don't have it
    if (!student.profile_image.includes('?v=')) {
      return `${student.profile_image}?v=${Date.now()}`;
    }
    
    return student.profile_image;
  }, [user, updateStudent, queryClient]);

  useEffect(() => {
    if (user && student && !studentLoading && !studentSkillsLoading) {
      const processStudentData = async () => {
        const currentSkillIds = studentSkills.map((ss) => ss.skill_id);
        
        // Start with the current profile image
        let profileImageToUse = student.profile_image || "";
        
        const newFormData = {
          name: student.name || "",
          country: student.country || "",
          university: student.university || "",
          phoneNumber: student.phone_number || "",
          profileImage: profileImageToUse,
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
        
        setFormData(newFormData);
        
        if (student.country) {
          setCountryInput(student.country);
          const matchingCountry = countriesData.find((country) => country.name.toLowerCase() === student.country?.toLowerCase());
          if (matchingCountry) {
            setSelectedCountry(matchingCountry);
          }
        }

        // Clear localStorage if user has a complete profile in the database
        if (student.isOnboarded && student.name && student.country && student.university && student.phone_number) {
          if (OnboardingStorage.exists()) {
            OnboardingStorage.clear();
          }
          setTempAvatarPath("");
        }
        
        // Fix profile image URL in background (non-blocking)
        if (student.profile_image?.includes('/temp-avatars/') && student.isOnboarded) {
          fixProfileImageUrl(student).then((fixedUrl) => {
            if (fixedUrl && fixedUrl !== student.profile_image) {
              setFormData(prev => ({ ...prev, profileImage: fixedUrl }));
            }
          }).catch((error) => {
            console.error('Error fixing profile image URL:', error);
          });
        } else if (student.profile_image && !student.profile_image.includes('?v=')) {
          // Add cache-busting to existing URLs
          const cacheBustedUrl = `${student.profile_image}?v=${Date.now()}`;
          setFormData(prev => ({ ...prev, profileImage: cacheBustedUrl }));
        }
      };
      
      processStudentData();
    }
  }, [user, student, studentLoading, studentSkills, studentSkillsLoading]);

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

  useEffect(() => {
    // Only save to localStorage if user is not authenticated or doesn't have complete profile
    if (!user || !student?.isOnboarded || !student?.name || !student?.country || !student?.university || !student?.phone_number) {
      if (formData.name || formData.country || formData.university || formData.phoneNumber) {
        const onboardingData: OnboardingData = {
          ...formData,
          tempAvatarPath,
        };
        OnboardingStorage.save(onboardingData);
      }
    }
  }, [formData, tempAvatarPath, user, student]);

  const handleSendMagicLink = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const onboardingData: OnboardingData = {
        ...formData,
        tempAvatarPath,
      };
      OnboardingStorage.save(onboardingData);
      await signInWithMagicLink(formData.email);
      router.push(`/welcome?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tempAvatarPath, signInWithMagicLink, router]);

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

  const handleCompleteProfile = useCallback(async () => {
    if (!user || !student) return;
    
    setIsSubmitting(true);
    try {
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

      if (formData.skillIds.length > 0) {
        await updateStudentSkills.mutateAsync({
          studentId: user.id,
          skillIds: formData.skillIds,
        });
      }

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

      OnboardingStorage.clear();
      toast.success("Profile completed successfully!");
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

  const handleNext = useCallback(() => {
    const maxStep = user ? 7 : 8;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    } else if (user && currentStep === 7) {
      handleCompleteProfile();
    } else if (!user && currentStep === 8) {
      handleSendMagicLink();
    }
  }, [currentStep, user, handleCompleteProfile, handleSendMagicLink]);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim() !== "" &&
          formData.country.trim() !== "" &&
          formData.university.trim() !== "" &&
          isValidPhone(formData.phoneNumber)
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
      // Check if user has a complete profile - if so, upload directly to permanent storage
      const hasCompleteProfile = user && student?.isOnboarded && student?.name && student?.country && student?.university && student?.phone_number;
      
      if (hasCompleteProfile) {
        // Upload directly to permanent storage and update database immediately
        const result = await uploadAvatar.mutateAsync({ file, userId: user.id });
        
        // Extract clean URL without cache-busting for database storage
        const cleanUrl = result.url.split('?')[0];
        
        // Update the database immediately with clean URL
        await updateStudent.mutateAsync({
          id: user.id,
          updates: {
            profile_image: cleanUrl,
          },
        });
        
        // Directly update the cached student data with clean URL
        queryClient.setQueryData(['student-by-user-id', user.id], (oldData: any) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                profile_image: cleanUrl
              }
            };
          }
          return oldData;
        });
        
        // Update local form data with cache-busted URL for immediate display
        setFormData((prev) => ({ ...prev, profileImage: result.url }));
        toast.success("Profile photo updated!");
      } else {
        // Use temporary storage for incomplete profiles
        const result = await uploadAvatar.mutateAsync({ file });
        setFormData((prev) => ({ ...prev, profileImage: result.url }));
        setTempAvatarPath(result.path);
        toast.success("Profile photo uploaded!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadAvatar, user, student, updateStudent, queryClient]);

  // Add a timeout for loading state to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (user && (studentLoading || studentSkillsLoading)) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [user, studentLoading, studentSkillsLoading]);

  if (user && (studentLoading || studentSkillsLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // If loading times out or there's an issue, continue with onboarding
  if (user && loadingTimeout) {
    console.warn("Loading timeout reached, proceeding with onboarding");
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
