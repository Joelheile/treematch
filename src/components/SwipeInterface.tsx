
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, X, MapPin, Target, Briefcase, TreePine } from "lucide-react";
import { Student } from "@/types/Student";

interface SwipeInterfaceProps {
  students: Student[];
  onBack: () => void;
}

export const SwipeInterface = ({ students, onBack }: SwipeInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);

  const currentStudent = students[currentIndex];

  const handleNext = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLike = () => {
    if (currentStudent) {
      setLikedProfiles([...likedProfiles, currentStudent.id]);
    }
    handleNext();
  };

  const handlePass = () => {
    handleNext();
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <TreePine className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium mb-2">You've seen everyone!</h3>
            <p className="mb-4">Check back later for new students joining Treematch.</p>
            <Button onClick={onBack} className="bg-red-600 hover:bg-red-700">
              Back to Browse
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
            <div className="flex items-center space-x-2">
              <TreePine className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-900">Discover</span>
            </div>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} of {students.length}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader className="text-center pb-4">
            {currentStudent.profileImage ? (
              <img
                src={currentStudent.profileImage}
                alt={currentStudent.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-red-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {currentStudent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentStudent.name}</h2>
              <div className="flex items-center justify-center text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                {currentStudent.city}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current Project */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Current Project
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {currentStudent.currentProject}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentStudent.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {currentStudent.lookingFor.map((item) => (
                  <Badge key={item} variant="outline" className="border-gray-300 text-gray-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Semester Goals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Semester Goals
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {currentStudent.summerGoals}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePass}
            className="w-16 h-16 rounded-full border-gray-300 hover:border-red-300 hover:bg-red-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </Button>
          <Button
            size="lg"
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
          >
            <Heart className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / students.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {likedProfiles.length} connections made
          </p>
        </div>
      </div>
    </div>
  );
};
