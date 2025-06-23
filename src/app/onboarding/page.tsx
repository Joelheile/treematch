"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import countriesData from "@/lib/countries.json";
import { AVAILABLE_SKILLS, LOOKING_FOR_OPTIONS } from "@/types/Student";
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
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/app/auth/AuthProvider";
import { useCreateStudent, useUpdateStudent } from "@/integrations/supabase/student-queries";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { toast } from "sonner";
import type { StudentInsert, StudentUpdate } from "@/integrations/supabase/student-service";

// Country code to flag emoji mapping
const countryToFlag = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { student, refetch } = useCurrentStudent();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  // Stable randomization instead of Math.random() anti-pattern
  const randomizedSkills = useMemo(() => {
    const skills = [...AVAILABLE_SKILLS];
    // Use a simple but stable shuffle
    for (let i = skills.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * 0.7); // Deterministic but mixed
      [skills[i], skills[j]] = [skills[j], skills[i]];
    }
    return skills;
  }, []);

  const randomizedLookingFor = useMemo(() => {
    const options = [...LOOKING_FOR_OPTIONS];
    // Use a different stable shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * 0.3); // Different deterministic pattern
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    university: "",
    profileImage: "",
    skills: [] as string[],
    lookingFor: [] as string[],
    summerGoals: "",
    currentProject: "",
    linkedinUrl: "",
    instagramHandle: "",
    twitterHandle: "",
    githubUsername: "",
  });

  // Country autocomplete state
  const [countryInput, setCountryInput] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    code: string;
  } | null>(null);

  // Memoized country suggestions based on input
  const countrySuggestions = useMemo(() => {
    if (!countryInput.trim()) return [];
    return countriesData
      .filter((country) =>
        country.name.toLowerCase().includes(countryInput.toLowerCase())
      )
      .slice(0, 5); // Show max 5 suggestions
  }, [countryInput]);

  // Country input handlers
  const handleCountryInputChange = useCallback((value: string) => {
    setCountryInput(value);
    setShowCountrySuggestions(value.length > 0);

    // Check if the input exactly matches a country
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
  }, []);

  const handleCountrySelect = useCallback(
    (country: { name: string; code: string }) => {
      setCountryInput(country.name);
      setSelectedCountry(country);
      setShowCountrySuggestions(false);
      setFormData((prev) => ({ ...prev, country: country.name }));
    },
    []
  );

  // Memoized steps to prevent recreation
  const steps = useMemo(
    () => [
      {
        number: 1,
        title: "Welcome",
        subtitle: "Basic Information",
        icon: TreePine,
        completed: currentStep > 1,
      },
      {
        number: 2,
        title: "Skills",
        subtitle: "Your Expertise",
        icon: Target,
        completed: currentStep > 2,
      },
      {
        number: 3,
        title: "Current Project",
        subtitle: "What You're Building",
        icon: Briefcase,
        completed: currentStep > 3,
      },
      {
        number: 4,
        title: "Goals",
        subtitle: "Your Aspirations",
        icon: Check,
        completed: currentStep > 4,
      },
      {
        number: 5,
        title: "Socials",
        subtitle: "Connect With You",
        icon: Users,
        completed: currentStep > 5,
      },
      {
        number: 6,
        title: "Profile Photo",
        subtitle: "Add Your Picture",
        icon: User,
        completed: false,
      },
    ],
    [currentStep]
  );

  // Optimized handlers with useCallback
  const handleSkillToggle = useCallback((skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }, []);

  const handleLookingForToggle = useCallback((option: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter((o) => o !== option)
        : [...prev.lookingFor, option],
    }));
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            profileImage: e.target?.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleCompleteProfile = useCallback(async () => {
    if (!user?.email) {
      toast.error("User email not found. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formatSocialUrl = (platform: string, input: string) => {
        if (!input.trim()) return null;
        
        switch (platform) {
          case 'linkedin':
            return input.startsWith('http') ? input : `https://www.linkedin.com/in/${input.replace('@', '')}`;
          case 'github':
            return input.startsWith('http') ? input : `https://github.com/${input.replace('@', '')}`;
          case 'twitter':
            return input.startsWith('http') ? input : `https://twitter.com/${input.replace('@', '')}`;
          case 'instagram':
            return input.startsWith('http') ? input : `https://instagram.com/${input.replace('@', '')}`;
          default:
            return input;
        }
      };

      const studentData: StudentInsert = {
        name: formData.name,
        email: user.email,
        country: formData.country,
        profile_image: formData.profileImage || null,
        skills: formData.skills,
        summer_goals: formData.lookingFor,
        current_project: formData.currentProject,
        phone_number: null,
        linkedin: formatSocialUrl('linkedin', formData.linkedinUrl),
        github: formatSocialUrl('github', formData.githubUsername),
        website: formatSocialUrl('twitter', formData.twitterHandle), // Using website field for Twitter for now
        isOnboarded: true
      };

      if (student) {
        const updateData: StudentUpdate = {
          ...studentData,
          id: undefined
        };
        await updateStudentMutation.mutateAsync({ id: student.id, updates: updateData });
        toast.success("Profile updated successfully!");
      } else {
        await createStudentMutation.mutateAsync(studentData);
        toast.success("Profile created successfully!");
      }

      await refetch();
      
      router.push('/');
      
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Failed to complete profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user?.email,
    formData,
    student,
    updateStudentMutation,
    createStudentMutation,
    refetch,
    router
  ]);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteProfile();
    }
  }, [currentStep, handleCompleteProfile]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Memoized validation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim() !== "" &&
          formData.country.trim() !== "" &&
          formData.university.trim() !== ""
        );
      case 2:
        return formData.skills.length > 0;
      case 3:
        return formData.currentProject.trim() !== "";
      case 4:
        return formData.summerGoals.trim() !== "";
      case 5:
        return true;
      case 6:
        return formData.profileImage.trim() !== "";
      default:
        return false;
    }
  }, [currentStep, formData]);

  const progressPercentage = useMemo(
    () => ((currentStep - 1) / (steps.length - 1)) * 100,
    [currentStep, steps.length]
  );

  const nameParts = useMemo(() => {
    const parts = formData.name.split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  }, [formData.name]);

  const handleNameChange = useCallback(
    (field: "first" | "last", value: string) => {
      setFormData((prev) => {
        if (field === "first") {
          return {
            ...prev,
            name: nameParts.lastName ? `${value} ${nameParts.lastName}` : value,
          };
        } else {
          return {
            ...prev,
            name: nameParts.firstName
              ? `${nameParts.firstName} ${value}`
              : value,
          };
        }
      });
    },
    [nameParts.firstName, nameParts.lastName]
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Welcome to Treematch!
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6 px-4">
                Connect with fellow students for projects, collaboration, and
                friendship.
              </p>
              <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base px-4">
                Let's start with some basic information to build your profile.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name*
                  </Label>
                  <Input
                    id="firstName"
                    value={nameParts.firstName}
                    onChange={(e) => handleNameChange("first", e.target.value)}
                    placeholder="First Name"
                    className="mt-1 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name*
                  </Label>
                  <Input
                    id="lastName"
                    value={nameParts.lastName}
                    onChange={(e) => handleNameChange("last", e.target.value)}
                    placeholder="Last Name"
                    className="mt-1 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="university"
                  className="text-sm font-medium text-gray-700"
                >
                  University*
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
                  placeholder="Start typing your university..."
                  className="mt-1 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  list="universities"
                />
              </div>

              <div className="relative">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Country*
                </Label>
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
                  className="mt-1 h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
                  autoComplete="off"
                />

                {/* Autocomplete suggestions */}
                {showCountrySuggestions && countrySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {countrySuggestions.map((country) => (
                      <div
                        key={country.code}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <span className="text-lg">
                          {countryToFlag(country.code)}
                        </span>
                        <span className="text-gray-900">{country.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected country flag display */}
                {selectedCountry && (
                  <div className="mt-1 ml-1 flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-2xl">
                      {countryToFlag(selectedCountry.code)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                What are your skills?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base px-4">
                Select the areas where you have experience or expertise. This
                helps others find you for the right projects.
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {randomizedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={
                      formData.skills.includes(skill) ? "default" : "outline"
                    }
                    className={`cursor-pointer text-center justify-center py-2 px-3 text-xs transition-all hover:scale-105 min-h-[36px] ${
                      formData.skills.includes(skill)
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                        : "hover:bg-red-50 hover:border-red-200 border-gray-300"
                    }`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Selected {formData.skills.length} skills
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                What's the coolest passion/project/thing you've done/have?
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
                This is your chance to showcase what makes you unique! Share
                something you're proud of - whether it's a current project, past
                achievement, hobby, or passion. Think of something that would
                spark an interesting conversation :)
              </p>
            </div>

            <div>
              <Label
                htmlFor="currentProject"
                className="text-lg font-semibold text-gray-700"
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
                className="min-h-[120px] mt-2 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <div className="bg-gray-50 rounded-lg p-4 mx-4 mb-6">
                <p className="text-sm text-gray-600">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                What do you hope to achieve this semester?*
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
                Tell others about what you want to achieve? Build something,
                meet VCs, get inspired, learn a new skill, etc.
              </p>
            </div>

            <div>
              <Label
                htmlFor="goals"
                className="text-lg font-semibold text-gray-700"
              ></Label>
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
                className="min-h-[120px] mt-2 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Connect with You
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-4">
                Share your social media links so others can connect with you
                outside of Treematch.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* LinkedIn */}
              <div>
                <Label
                  htmlFor="linkedinUrl"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
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
                  className="mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Instagram */}
              <div>
                <Label
                  htmlFor="instagramHandle"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
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
                  className="mt-1 h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* Twitter */}
              <div>
                <Label
                  htmlFor="twitterHandle"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
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
                  className="mt-1 h-12 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              {/* GitHub */}
              <div>
                <Label
                  htmlFor="githubUsername"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
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
                  className="mt-1 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Add Your Profile Photo*
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-4">
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
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, profileImage: "" }))
                      }
                      className="h-11"
                    >
                      Remove Photo
                    </Button>
                    <Label
                      htmlFor="image-upload-change"
                      className="cursor-pointer"
                    >
                      <Button variant="outline" asChild className="h-11">
                        <span>Change Photo</span>
                      </Button>
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-change"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 h-12"
                      asChild
                    >
                      <span>Upload Photo</span>
                    </Button>
                  </Label>
                  <p className="text-sm text-gray-500 mt-4">
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Treematch
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentStep} of {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={progressPercentage}
            className="h-2 [&>div]:bg-red-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{steps[currentStep - 1]?.title}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 w-full">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-red-600 p-2 rounded-lg">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Treematch
            </div>
          </div>

          <div className="space-y-1">
            {steps.map((step) => {
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
                  <div>
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pb-24">
        <div className="w-full max-w-2xl">
          <div className="p-6 sm:p-8 lg:p-12">{renderStepContent()}</div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between max-w-2xl mx-auto">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 sm:px-6 h-11 border-gray-300 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={!isStepValid || isSubmitting}
            className={`px-6 sm:px-8 font-semibold h-11 ${
              currentStep === 6
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-900 hover:bg-black text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting 
              ? "Saving..." 
              : currentStep === 6 
                ? "Complete Profile" 
                : "Continue"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
