
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { Student, AVAILABLE_SKILLS, LOOKING_FOR_OPTIONS } from "@/types/Student";

interface OnboardingFlowProps {
  onComplete: (student: Student) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    profileImage: "",
    skills: [] as string[],
    lookingFor: [] as string[],
    summerGoals: ""
  });

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleLookingForToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter(o => o !== option)
        : [...prev.lookingFor, option]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      const student: Student = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
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
      case 1: return formData.name.trim() !== "" && formData.city.trim() !== "";
      case 2: return true; // Image is optional
      case 3: return formData.skills.length > 0;
      case 4: return formData.lookingFor.length > 0 && formData.summerGoals.trim() !== "";
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Welcome to Stanford Connect!</h2>
              <p className="text-gray-600 mt-2">Let's get you set up to find your perfect summer session partners</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Hometown</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., San Francisco, CA"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Add Your Photo</h2>
              <p className="text-gray-600 mt-2">Help others recognize you around campus</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              {formData.profileImage ? (
                <div className="relative">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setFormData(prev => ({ ...prev, profileImage: "" }))}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Upload Photo</span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Your Skills</h2>
              <p className="text-gray-600 mt-2">Select the skills you bring to the table</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.skills.includes(skill) ? "default" : "outline"}
                  className={`cursor-pointer text-center justify-center py-2 px-3 transition-all hover:scale-105 ${
                    formData.skills.includes(skill) 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "hover:bg-red-50 hover:border-red-200"
                  }`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Selected: {formData.skills.length} skills
            </p>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">What are you looking for?</h2>
              <p className="text-gray-600 mt-2">Help us match you with the right people</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">I'm looking for:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <Badge
                      key={option}
                      variant={formData.lookingFor.includes(option) ? "default" : "outline"}
                      className={`cursor-pointer text-center justify-center py-2 px-3 transition-all hover:scale-105 ${
                        formData.lookingFor.includes(option)
                          ? "bg-red-600 hover:bg-red-700"
                          : "hover:bg-red-50 hover:border-red-200"
                      }`}
                      onClick={() => handleLookingForToggle(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="goals">Summer Session Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.summerGoals}
                  onChange={(e) => setFormData(prev => ({ ...prev, summerGoals: e.target.value }))}
                  placeholder="What do you hope to accomplish this summer? What projects are you working on?"
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <CardTitle className="text-sm text-gray-500">
            Step {currentStep} of 4
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              <span>{currentStep === 4 ? "Complete" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
