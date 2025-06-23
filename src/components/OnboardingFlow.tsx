import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  AVAILABLE_SKILLS,
  LOOKING_FOR_OPTIONS,
  Student,
} from "@/types/Student";
import {
  Briefcase,
  Check,
  ChevronLeft,
  Target,
  TreePine,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

interface OnboardingFlowProps {
  onComplete: (student: Student) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Randomize skills and looking for options
  const randomizedSkills = useMemo(() => {
    return [...AVAILABLE_SKILLS].sort(() => Math.random() - 0.5);
  }, []);

  const randomizedLookingFor = useMemo(() => {
    return [...LOOKING_FOR_OPTIONS].sort(() => Math.random() - 0.5);
  }, []);

  // Autocomplete data
  const universities = [
    "Stanford University",
    "University of California, Berkeley",
    "Harvard University",
    "MIT",
    "Yale University",
    "Princeton University",
    "University of Chicago",
    "Columbia University",
    "University of Pennsylvania",
    "Cornell University",
    "UCLA",
    "USC",
    "NYU",
    "Northwestern University",
    "Duke University",
  ];

  const cities = [
    "San Francisco, CA",
    "Los Angeles, CA",
    "New York, NY",
    "Chicago, IL",
    "Boston, MA",
    "Seattle, WA",
    "Austin, TX",
    "Denver, CO",
    "Portland, OR",
    "San Diego, CA",
    "Miami, FL",
    "Atlanta, GA",
    "Dallas, TX",
    "Philadelphia, PA",
    "Washington, DC",
  ];

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    university: "",
    profileImage: "",
    skills: [] as string[],
    lookingFor: [] as string[],
    summerGoals: "",
    currentProject: "",
  });

  const steps = [
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
      title: "Profile Photo",
      subtitle: "Add Your Picture",
      icon: User,
      completed: false,
    },
  ];

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleLookingForToggle = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter((o) => o !== option)
        : [...prev.lookingFor, option],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      const student: Student = {
        id: Date.now().toString(),
        ...formData,
        lookingFor: [], // Set empty array since we removed this step
        createdAt: new Date(),
      };
      onComplete(student);
    }
  };

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
          formData.city.trim() !== "" &&
          formData.university.trim() !== ""
        );
      case 2:
        return formData.skills.length > 0;
      case 3:
        return formData.currentProject.trim() !== "";
      case 4:
        return formData.summerGoals.trim() !== "";
      case 5:
        return formData.profileImage.trim() !== ""; // Profile image is required
      default:
        return false;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Welcome to Treematch!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6 px-4">
                Connect with fellow students for projects, collaboration, and
                friendship.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base px-4">
                Let's start with some basic information to build your profile.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    First Name*
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.name.split(" ")[0] || ""}
                    onChange={(e) => {
                      const lastName = formData.name
                        .split(" ")
                        .slice(1)
                        .join(" ");
                      setFormData((prev) => ({
                        ...prev,
                        name: lastName
                          ? `${e.target.value} ${lastName}`
                          : e.target.value,
                      }));
                    }}
                    placeholder="First Name"
                    className="mt-1 h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Last Name*
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.name.split(" ").slice(1).join(" ") || ""}
                    onChange={(e) => {
                      const firstName = formData.name.split(" ")[0] || "";
                      setFormData((prev) => ({
                        ...prev,
                        name: firstName
                          ? `${firstName} ${e.target.value}`
                          : e.target.value,
                      }));
                    }}
                    placeholder="Last Name"
                    className="mt-1 h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="university"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                  className="mt-1 h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
                  list="universities"
                />
                <datalist id="universities">
                  {universities.map((university) => (
                    <option key={university} value={university} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Hometown*
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Where are you from?"
                  className="mt-1 h-12 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
                  list="cities"
                />
                <datalist id="cities">
                  {cities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                What are your skills?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base px-4">
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
                        : "hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 border-gray-300 dark:border-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Selected {formData.skills.length} skills
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                What's the coolest passion/project/thing you've done/have?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base px-4">
                This is your chance to showcase what makes you unique! Share
                something you're proud of - whether it's a current project, past
                achievement, hobby, or passion. Think of something that would
                spark an interesting conversation :)
              </p>
            </div>

            <div>
              <Label
                htmlFor="currentProject"
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
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
                className="min-h-[120px] mt-2 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
              />
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mx-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                What do you hope to achieve this semester?*
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base px-4">
                Tell others about what you want to achieve? Build something,
                meet VCs, get inspired, learn a new skill, etc.
              </p>
            </div>

            <div>
              <Label
                htmlFor="goals"
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
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
                className="min-h-[120px] mt-2 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Add Your Profile Photo*
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base px-4">
                Upload a friendly photo so others can recognize you around
                campus.
              </p>

              {formData.profileImage ? (
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-red-100 dark:border-red-900 mx-auto"
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
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Treematch
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep} of {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={progressPercentage}
            className="h-2 [&>div]:bg-red-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{steps[currentStep - 1]?.title}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
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
                      ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                      : step.completed
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.number === currentStep
                        ? "bg-red-600 text-white"
                        : step.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl  dark:bg-gray-900">
          <div className="p-6 sm:p-8 lg:p-12">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200 dark:border-gray-700">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-4 sm:px-6 h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              ) : (
                <div />
              )}

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-6 sm:px-8 font-semibold h-11 ${
                  currentStep === 5
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {currentStep === 5 ? "Complete Profile" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
