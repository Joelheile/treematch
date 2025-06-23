
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, TreePine, Mail, User, Target, Briefcase, Heart } from "lucide-react";
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
    summerGoals: "",
    currentProject: ""
  });

  const steps = [
    { number: 1, title: "Welcome to Treematch", icon: TreePine, completed: currentStep > 1 },
    { number: 2, title: "Profile Setup", icon: User, completed: currentStep > 2 },
    { number: 3, title: "Your Skills", icon: Target, completed: currentStep > 3 },
    { number: 4, title: "What You're Seeking", icon: Heart, completed: currentStep > 4 },
    { number: 5, title: "Current Projects", icon: Briefcase, completed: currentStep > 5 },
    { number: 6, title: "Ready to Connect", icon: Check, completed: false }
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
      case 3: return formData.skills.length > 0;
      case 4: return formData.lookingFor.length > 0;
      case 5: return formData.currentProject.trim() !== "";
      case 6: return formData.summerGoals.trim() !== "";
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-8">
            <div className="bg-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <TreePine className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Treematch!</h1>
              <p className="text-gray-600 text-xl leading-relaxed mb-6">
                Connect with fellow Stanford students for projects, collaboration, and friendship.
              </p>
              <p className="text-gray-500">
                Let's build your profile to find your perfect study partners and project collaborators.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
              <p className="text-gray-600">Tell us about yourself so others can find you</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
              <p className="text-gray-600 mb-6">Upload a friendly photo so others can recognize you around campus</p>
              
              {formData.profileImage ? (
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setFormData(prev => ({ ...prev, profileImage: "" }))}
                  >
                    Change Photo
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
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3" asChild>
                      <span>Upload Photo</span>
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
                    className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
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
                    className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium">Where are you from?*</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., San Francisco, CA"
                  className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What are your skills?</h2>
              <p className="text-gray-600">
                Select the areas where you have experience or expertise. This helps others find you for the right projects.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 ${
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

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What are you looking for?</h2>
              <p className="text-gray-600 mb-6">
                Let others know what type of collaboration or connection you're seeking this semester.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <Badge
                    key={option}
                    variant={formData.lookingFor.includes(option) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 ${
                      formData.lookingFor.includes(option)
                        ? "bg-gray-900 hover:bg-black text-white border-gray-900"
                        : "hover:bg-gray-50 hover:border-gray-400 border-gray-300"
                    }`}
                    onClick={() => handleLookingForToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Selected {formData.lookingFor.length} options
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What exciting project are you working on?</h2>
              <p className="text-gray-600 mb-6">
                Share what you're passionate about right now. This could be a class project, startup idea, research, or personal interest.
              </p>
            </div>

            <div>
              <Label htmlFor="currentProject" className="text-lg font-semibold">Current Project or Passion*</Label>
              <Textarea
                id="currentProject"
                value={formData.currentProject}
                onChange={(e) => setFormData(prev => ({ ...prev, currentProject: e.target.value }))}
                placeholder="e.g., Building an AI app for course scheduling, researching sustainable energy solutions, starting a campus food delivery service..."
                className="min-h-[120px] mt-2 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Almost ready to connect!</h2>
              <p className="text-gray-600 mb-6">
                One last thing - tell us about your goals for this semester.
              </p>
            </div>

            <div>
              <Label htmlFor="goals" className="text-lg font-semibold mb-4 block">What do you hope to achieve this semester?*</Label>
              <Textarea
                id="goals"
                value={formData.summerGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, summerGoals: e.target.value }))}
                placeholder="e.g., Launch my startup, complete my CS thesis, find an internship, build my network, learn new skills..."
                className="min-h-[120px] border-gray-300 focus:border-red-500 focus:ring-red-500"
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
      <div className="w-80 bg-white shadow-lg border-r">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-red-600 p-2 rounded-lg">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Treematch</div>
          </div>
          
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    step.number === currentStep 
                      ? 'bg-red-50 border border-red-200' 
                      : step.completed 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number === currentStep
                      ? 'bg-red-600 text-white'
                      : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-3xl shadow-xl bg-white">
          <CardContent className="p-12">
            {renderStepContent()}
            
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-8 border-gray-300 hover:bg-gray-50"
                >
                  Back
                </Button>
              ) : <div />}
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-8 font-semibold ${
                  currentStep === 6 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                {currentStep === 6 ? 'Join Treematch' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
