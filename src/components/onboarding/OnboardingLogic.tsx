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
import Image from "next/image";
import { createClient } from "@/integrations/supabase/client-ssr";


export default function OnboardingLogic() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreatingAccount = useRef(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
    hasEngr145Team: false,
  });
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
        { number: 4, title: "Coolest Thing", subtitle: "What You're Most Proud Of" },
        { number: 5, title: "Goals", subtitle: "Your Aspirations" },
        { number: 6, title: "Connect", subtitle: "Social Links" },
        { number: 7, title: "Photo", subtitle: "Profile Picture" },
        { number: 8, title: "Account", subtitle: "Create Your Account" },
      ];

  // Load existing student data if user is authenticated
  useEffect(() => {
    if (user && student && !studentLoading && !studentSkillsLoading) {
      // For authenticated users with existing student data
      const currentSkillIds = studentSkills.map((ss) => ss.skill_id);
      
      const phoneNumber = student.phone_number && student.phone_number.trim() 
        ? student.phone_number 
        : "";
      
      const newFormData = {
        name: student.name || "",
        country: student.country || "",
        university: student.university || "",
        phoneNumber: phoneNumber,
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
        hasEngr145Team: (student as any).has_engr145_team || false,
      };
      
      setFormData(newFormData);
      
      if (student.country) {
        setCountryInput(student.country);
        const matchingCountry = countriesData.find((country) => country.name.toLowerCase() === student.country?.toLowerCase());
        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
        }
      }
    }
  }, [user, student, studentLoading, studentSkills, studentSkillsLoading]);



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

    if (currentStep !== 8) {
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
  }, [user, signUp, currentStep, formData, suggestedSkill, addStudent, updateStudentSkills, addSkill, router, queryClient]);



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

      toast.success("Profile completed successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, student, formData, suggestedSkill, updateStudent, addStudent, updateStudentSkills, addSkill, router, queryClient]);

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
        // For unauthenticated users, EmailStep handles its own validation
        // We'll let the EmailStep component control the submit button
        return !user ? true : false;
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

  // Show loading state for authenticated users
  if (user && (studentLoading || studentSkillsLoading)) {
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
      handleSuggestSkill={() => {}}
      suggestedSkill={suggestedSkill}
      setSuggestedSkill={setSuggestedSkill}
      handleNext={handleNext}
      handleBack={handleBack}
      setShowCountrySuggestions={setShowCountrySuggestions}
      onCreateAccount={handleCreateAccount}
    />
  );
}
