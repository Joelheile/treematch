"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { useAddSkill } from "@/integrations/supabase/useAddSkill";
import { useSkills } from "@/integrations/supabase/useSkills";
import {
  useStudentSkills,
  useUpdateStudentSkills,
} from "@/integrations/supabase/useStudentSkills";
import { useUpdateStudent } from "@/integrations/supabase/useUpdateStudent";
import { useAddStudent } from "@/integrations/supabase/useAddStudent";
import { useUploadAvatar } from "@/integrations/supabase/useUploadAvatar";
import countriesData from "@/lib/countries.json";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import OnboardingUI from "./OnboardingUI";
import { FormData } from "./types";
import { isValidPhone } from "@/lib/phone-validation";
import { debounce } from "@/lib/utils";
import Image from "next/image";
import { createClient } from "@/integrations/supabase/client-ssr";
import { validateReferralCode } from "@/lib/validation";


const getInitialFormData = (referralCode?: string): FormData => ({
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
  hasEngr145Team: false,
  referralCode: referralCode || "",
});

interface OnboardingLogicProps {
  referralCode?: string;
}

export default function OnboardingLogic({ referralCode }: OnboardingLogicProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isCreatingAccount = useRef(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const FORM_DATA_KEY = 'treematch-edit-form-data';

  const { user, loading: authLoading, signUp } = useAuth();
  const { student, isLoading: studentLoading } = useCurrentStudent();
  const { data: allSkills = [], isLoading: skillsLoading } = useSkills();

  const availableSkills = useMemo(() => allSkills.filter((skill) => skill.is_global), [allSkills]);
  const suggestedSkills = useMemo(() => allSkills.filter((skill) => !skill.is_global), [allSkills]);
  const updateStudentSkills = useUpdateStudentSkills();
  const { data: studentSkills = [], isLoading: studentSkillsLoading } = useStudentSkills(student?.id);
  const updateStudent = useUpdateStudent();
  const addStudent = useAddStudent();
  const uploadAvatar = useUploadAvatar();
  const addSkill = useAddSkill();

  const [suggestedSkill, setSuggestedSkill] = useState("");
  const [formData, setFormData] = useState<FormData>(getInitialFormData(referralCode));
  const [countryInput, setCountryInput] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tempAvatarPath, setTempAvatarPath] = useState<string>("");

  // Steps for both authenticated and unauthenticated users
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
        { number: 4, title: "Photo", subtitle: "Profile Picture" },
        { number: 5, title: "Account", subtitle: "Create Your Account" },
      ];

  // Single effect to handle all initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    
    const initializeForm = async () => {
      try {
        // 1. Load from localStorage first
        const saved = localStorage.getItem(FORM_DATA_KEY);
        if (saved && mounted) {
          try {
            setFormData(JSON.parse(saved));
            setIsHydrated(true);
            return; // Exit early if localStorage data exists
          } catch (e) {
            console.error('Failed to parse saved form data:', e);
            // Clear corrupted data and continue
            localStorage.removeItem(FORM_DATA_KEY);
          }
        }
      
      // 2. Load from database only if no localStorage data and user/student exist
      if (user && student && !studentLoading && !studentSkillsLoading && mounted) {
        const currentSkillIds = Array.isArray(studentSkills) ? studentSkills.map((ss) => ss?.skill_id).filter(Boolean) : [];
        
        const dbData = {
          name: student.name || "",
          country: student.country || "",
          university: student.university || "",
          phoneNumber: student.phone_number?.trim() || "",
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
          hasEngr145Team: Boolean(student.has_engr145_team),
        };
        
        setFormData(dbData);
      }
      
        if (mounted) {
          setIsHydrated(true);
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        if (mounted) {
          setHasError(true);
          setIsHydrated(true); // Still set hydrated to show error state
        }
      }
    };
    
    initializeForm();
    
    return () => {
      mounted = false;
    };
  }, [user, student, studentLoading, studentSkills, studentSkillsLoading]);

  // Separate effect for country input synchronization
  useEffect(() => {
    if (formData.country && isHydrated) {
      setCountryInput(formData.country);
      const matchingCountry = countriesData.find((country) => 
        country.name.toLowerCase() === formData.country.toLowerCase()
      );
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
      }
    }
  }, [formData.country, isHydrated]);

  // Simple localStorage save
  useEffect(() => {
    if (!isHydrated) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          toast.error('Storage full - changes may not save');
        }
        console.error('localStorage save failed:', error);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [formData, isHydrated]);

  // Cleanup function to clear localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FORM_DATA_KEY);
      }
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [FORM_DATA_KEY]);



  const handleCreateAccount = useCallback(async (email: string, password: string) => {


    if (isCreatingAccount.current) {
      return;
    }

    // Check if user is already logged in
    if (user) {
      toast.error("You are already logged in");
      router.push("/");
      return;
    }

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    if (!email.endsWith("@stanford.edu")) {
      toast.error("Please use a valid Stanford email address (@stanford.edu)");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (currentStep !== 5) {
      toast.error("Please complete all profile steps first");
      return;
    }

    // Validate form data before creating account
    if (!formData.name.trim() || !formData.country.trim() || !formData.university.trim()) {
      toast.error("Please complete all required fields before creating account");
      return;
    }

    isCreatingAccount.current = true;
    setIsSubmitting(true);
    
    try {
      // Create auth account first
      const authData = await signUp(email, password);
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }
      
      // Check if student already exists (this might be the 409 source)
      const supabase = createClient();
      
      // Check by ID
      const { data: existingStudentById } = await supabase
        .from('students')
        .select('id, email')
        .eq('id', authData.user.id)
        .single();
      
      // Check by email (unique constraint)
      const { data: existingStudentByEmail } = await supabase
        .from('students')
        .select('id, email')
        .eq('email', email)
        .single();
      
      let studentRecord;
      
      if (existingStudentById) {
        
        // Update the existing student record with form data
        const updateData = {
          name: formData.name,
          country: formData.country,
          university: formData.university,
          phone_number: formData.phoneNumber,
          profile_image: formData.profileImage,
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
          has_engr145_team: formData.hasEngr145Team || false,
        };
        
        const { data: updatedStudent, error: updateError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', authData.user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error("Failed to update student:", updateError);
          throw updateError;
        }
        
        studentRecord = updatedStudent;
        
              } else if (existingStudentByEmail) {
          toast.error("An account with this email already exists. Please try logging in.");
          router.push("/auth/login");
          return;
          
        } else {
        
         // Create student profile using current form data
         const studentData = {
           id: authData.user.id,
           email: email,
           name: formData.name,
           country: formData.country,
           university: formData.university,
           phone_number: formData.phoneNumber,
           profile_image: formData.profileImage,
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
           has_engr145_team: formData.hasEngr145Team || false,
         };

         // Create student profile
         try {
           const createdStudent = await addStudent.mutateAsync({
             student: studentData,
             skillIds: formData.skillIds,
           });
           studentRecord = createdStudent;
         } catch (studentError) {
           console.error("Failed to create student profile:", studentError);
           console.error("Student error details:", {
             code: studentError?.code,
             message: studentError?.message,
             details: studentError?.details,
             hint: studentError?.hint
           });
           throw studentError;
         }
       }

        // Process referral code if provided
        if (formData.referralCode?.trim()) {
          try {
            const validCode = validateReferralCode(formData.referralCode.trim());
            if (validCode) {
              // Use transaction for atomic referral processing
              const { data: referralData, error: fetchError } = await supabase
                .from('referrals')
                .select('id, referrer_id')
                .eq('referral_code', validCode)
                .eq('is_used', false)
                .neq('referrer_id', authData.user.id) // Prevent self-referral
                .single();

              if (!fetchError && referralData) {
                // Atomic update with proper error handling
                const { error: updateError } = await supabase
                  .from('referrals')
                  .update({
                    referred_id: authData.user.id,
                    is_used: true,
                    used_at: new Date().toISOString()
                  })
                  .eq('id', referralData.id)
                  .eq('is_used', false); // Prevent race conditions
                
                if (!updateError) {
                  toast.success("Referral bonus applied!");
                } else {
                  console.warn("Referral already used or invalid:", updateError);
                }
              } else if (fetchError?.code !== 'PGRST116') {
                // Log non-"not found" errors
                console.warn("Referral lookup error:", fetchError);
              }
            }
          } catch (error) {
            console.error("Error processing referral:", error);
            // Don't block account creation if referral processing fails
          }
        }

              // Add skills for existing students (new students get skills via addStudent)
        if (existingStudentById && formData.skillIds.length > 0) {
          try {
            await updateStudentSkills.mutateAsync({
              studentId: authData.user.id,
              skillIds: formData.skillIds,
            });
          } catch (error) {
            console.error("Error adding skills:", error);
          }
        }

        // Add suggested skill if provided
        if (suggestedSkill.trim()) {
          try {
            const newSkill = await addSkill.mutateAsync({
              name: suggestedSkill.trim(),
              is_global: false,
            });
            if (newSkill) {
              await updateStudentSkills.mutateAsync({
                studentId: authData.user.id,
                skillIds: [...formData.skillIds, newSkill.id],
              });
            }
          } catch (error) {
            console.error("Error adding suggested skill:", error);
          }
        }

              // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['student', authData.user.id] });
        await queryClient.invalidateQueries({ queryKey: ['students'] });
        
        // Clear localStorage after successful account creation
        clearLocalStorage();
        
        toast.success("Account created! Please check your email to verify your account.");
        router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
      
    } catch (error: any) {
      console.error("Account creation error:", error);
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
        details: error?.details
      });
      
      // Handle specific error cases
      if (error?.code === '23505' || error.message?.includes('duplicate key')) {
        toast.error("Account already exists. Please try logging in instead.");
        router.push("/auth/login");
      } else if (error.message?.includes('User already registered')) {
        toast.error("Account already exists. Please try logging in instead.");
        router.push("/auth/login");
      } else if (error.message?.includes('Email already registered')) {
        toast.error("This email is already registered. Please try logging in instead.");
        router.push("/auth/login");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      isCreatingAccount.current = false;
    }
  }, [user, signUp, currentStep, formData, suggestedSkill, addStudent, updateStudentSkills, addSkill, router, queryClient, clearLocalStorage]);



  const handleCompleteProfile = useCallback(async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const profileData = {
        name: formData.name,
        country: formData.country,
        university: formData.university,
        phone_number: formData.phoneNumber,
        profile_image: formData.profileImage,
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
        has_engr145_team: formData.hasEngr145Team || false,
      };

      if (student) {
        // Update existing student profile
        await updateStudent.mutateAsync({
          id: user.id,
          updates: profileData,
        });
      } else {
        // Create new student profile if it doesn't exist
        const studentData = {
          id: user.id,
          email: user.email || "",
          ...profileData,
        };

        await addStudent.mutateAsync({
          student: studentData,
          skillIds: formData.skillIds,
        });
      }

      // Update skills if any selected
      if (formData.skillIds.length > 0) {
        await updateStudentSkills.mutateAsync({
          studentId: user.id,
          skillIds: formData.skillIds,
        });
      }

      // Add suggested skill if provided
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

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['student', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });

      // Clear localStorage after successful profile completion
      clearLocalStorage();

      toast.success("Profile completed successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, student, formData, suggestedSkill, updateStudent, addStudent, updateStudentSkills, addSkill, router, queryClient, clearLocalStorage]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (user) {
      // User is authenticated, complete profile
      handleCompleteProfile();
    }
    // For unauthenticated users, the account creation is handled in the EmailStep component
  }, [currentStep, steps.length, user, handleCompleteProfile]);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    if (user) {
      // Authenticated user steps (1-7)
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
        default:
          return false;
      }
    } else {
      // Unauthenticated user steps (1-5, skipping coolest thing, goals, social links)
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
          return formData.profileImage.trim() !== "" && !isUploadingImage;
        case 5:
          // EmailStep handles its own validation
          return true;
        default:
          return false;
      }
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

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Something went wrong loading your profile.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state until hydrated
  if (user && (studentLoading || studentSkillsLoading || !isHydrated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Image src="/logo.png" alt="TreeMatch Logo" width={48} height={48} className="mx-auto animate-pulse" />
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
      countrySuggestions={countriesData.filter((country) => 
        country.name.toLowerCase().includes(countryInput.toLowerCase())
      ).slice(0, 5)}
      availableSkills={availableSkills}
      suggestedSkills={suggestedSkills}
      skillsLoading={skillsLoading}
      name={formData.name}
      progressPercentage={((currentStep - 1) / (steps.length - 1)) * 100}
      isStepValid={isStepValid()}
      isSubmitting={isSubmitting}
      isUploadingImage={isUploadingImage}
      user={user}
      student={student}
      handleCountryInputChange={setCountryInput}
      handleCountrySelect={handleCountrySelect}
      handleNameChange={(value) => {
        setFormData((prev) => ({ 
          ...prev, 
          name: value 
        }));
      }}
      handleImageUpload={handleImageUpload}
      handleSuggestSkill={() => {
        if (!suggestedSkill.trim()) return;
        
        try {
          addSkill.mutateAsync({
            name: suggestedSkill.trim(),
            is_global: false,
          }).then(newSkill => {
            if (newSkill) {
              setFormData(prev => ({
                ...prev,
                skillIds: [...prev.skillIds, newSkill.id]
              }));
              setSuggestedSkill("");
              toast.success(`Added skill: ${newSkill.name}`);
            }
          });
        } catch (error) {
          console.error("Error adding suggested skill:", error);
          toast.error("Failed to add skill. Please try again.");
        }
      }}
      suggestedSkill={suggestedSkill}
      setSuggestedSkill={setSuggestedSkill}
      handleNext={handleNext}
      handleBack={handleBack}
      setShowCountrySuggestions={setShowCountrySuggestions}
      onCreateAccount={handleCreateAccount}
    />
  );
}
