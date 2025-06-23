
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Check, LogOut } from "lucide-react";
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

  const steps = [
    { number: 1, title: "Welcome!", completed: currentStep > 1 },
    { number: 2, title: "Your Profile", completed: currentStep > 2 },
    { number: 3, title: "Skills", completed: currentStep > 3 },
    { number: 4, title: "Focus Areas", completed: currentStep > 4 },
    { number: 5, title: "Matching", completed: currentStep > 5 },
    { number: 6, title: "Submit", completed: false }
  ];

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
    if (currentStep < 6) {
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
      case 1: return true;
      case 2: return formData.name.trim() !== "" && formData.city.trim() !== "";
      case 3: return true;
      case 4: return formData.skills.length > 0;
      case 5: return formData.lookingFor.length > 0;
      case 6: return formData.summerGoals.trim() !== "";
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Great that you want to enrich our mentoring network!
              </p>
              <p className="text-gray-600 mt-4">
                Please fill out the following fields so we can optimally integrate you and your expertise.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Select Profile Picture</h3>
              <p className="text-gray-600 mb-6">Please upload a profile picture where you can be easily recognized. (max. 5MB)</p>
              
              {formData.profileImage ? (
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setFormData(prev => ({ ...prev, profileImage: "" }))}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3" asChild>
                      <span>Upload Profile Picture</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name*</Label>
                  <Input
                    id="firstName"
                    value={formData.name.split(' ')[0] || ''}
                    onChange={(e) => {
                      const lastName = formData.name.split(' ').slice(1).join(' ');
                      setFormData(prev => ({ 
                        ...prev, 
                        name: lastName ? `${e.target.value} ${lastName}` : e.target.value 
                      }));
                    }}
                    placeholder="First Name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name*</Label>
                  <Input
                    id="lastName"
                    value={formData.name.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const firstName = formData.name.split(' ')[0] || '';
                      setFormData(prev => ({ 
                        ...prev, 
                        name: firstName ? `${firstName} ${e.target.value}` : e.target.value 
                      }));
                    }}
                    placeholder="Last Name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium">Hometown*</Label>
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Skills</h2>
              <p className="text-gray-600">
                Select your expertise. In the next step, you'll determine the areas where you'd especially like to support your mentees.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Your Expertise</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 ${
                      formData.skills.includes(skill) 
                        ? "bg-gray-800 hover:bg-gray-900 text-white" 
                        : "hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Focus Areas</h2>
              <p className="text-gray-600 mb-6">
                You have expertise in many areas - that's great! Now select the skills in which you'd especially like to support your mentees.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Prioritize the phases where you can help best.</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <Badge
                    key={option}
                    variant={formData.lookingFor.includes(option) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 ${
                      formData.lookingFor.includes(option)
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => handleLookingForToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Matching</h2>
              <p className="text-gray-600 mb-6">
                What is your preferred channel for first contact?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-4 text-sm">
                📧 E-Mail
              </Button>
              <Button variant="outline" className="py-4 text-sm">
                📞 Phone
              </Button>
              <Button variant="outline" className="py-4 text-sm">
                📹 Video-Call
              </Button>
              <Button variant="outline" className="py-4 text-sm">
                👥 Personal Meeting
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit Application</h2>
              <p className="text-gray-600 mb-4">
                Your mentoring application is completely filled out.
              </p>
              <p className="text-gray-600 mb-6">
                Click "Submit" to submit your application.
              </p>
              <p className="text-sm text-gray-500">
                After submission, you will receive a confirmation by email.
                Our team will contact you within a few days.
              </p>
            </div>

            <div className="mt-8">
              <Label htmlFor="goals" className="text-left block text-lg font-semibold mb-4">Summer Session Goals</Label>
              <Textarea
                id="goals"
                value={formData.summerGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, summerGoals: e.target.value }))}
                placeholder="What do you hope to accomplish this summer? What projects are you working on?"
                className="min-h-[120px] text-left"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg">
        <div className="p-6">
          <div className="text-2xl font-bold bg-black text-white px-3 py-2 rounded mb-8">
            STANFORD
          </div>
          
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center space-x-3 p-2 rounded ${
                  step.number === currentStep 
                    ? 'bg-yellow-100' 
                    : step.completed 
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.number === currentStep
                    ? 'bg-yellow-400 text-black'
                    : step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t">
            <Button variant="ghost" className="flex items-center space-x-2 text-gray-600">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl shadow-xl bg-white">
          <CardContent className="p-12">
            {renderStepContent()}
            
            <div className="flex justify-between pt-8 mt-8 border-t">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-8"
                >
                  Back
                </Button>
              ) : <div />}
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-8 font-semibold ${
                  currentStep === 6 
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {currentStep === 6 ? 'Submit' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
