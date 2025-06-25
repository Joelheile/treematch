import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useStudentLikes } from "@/integrations/supabase/useStudentLikes";
import type { StudentWithSkills } from "@/types/Student";
import countriesData from "@/lib/countries.json";
import {
  Briefcase,
  Edit,
  ExternalLink,
  Github,
  Heart,
  Linkedin,
  MapPin,
  Target,
} from "lucide-react";
import { useState } from "react";
import { StudentDetailPopup } from "./StudentDetailPopup";

interface StudentCardProps {
  student: StudentWithSkills;
}

export const StudentCard = ({ student }: StudentCardProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isLiked, toggleLike, isToggling } = useStudentLikes();
  const hasLinks = student.linkedin || student.github || student.website;

  // Helper function to format social media URLs
  const formatSocialUrl = (platform: string, username: string) => {
    if (!username) return '';
    
    // Remove any existing URL prefixes
    const cleanUsername = username.replace(/^https?:\/\/(www\.)?(linkedin\.com\/in\/|github\.com\/|instagram\.com\/)?/, '').replace(/\/$/, '');
    
    switch (platform) {
      case 'linkedin':
        return `https://linkedin.com/in/${cleanUsername}`;
      case 'github':
        return `https://github.com/${cleanUsername}`;
      case 'instagram':
        return `https://instagram.com/${cleanUsername}`;
      default:
        return cleanUsername.startsWith('http') ? cleanUsername : `https://${cleanUsername}`;
    }
  };

  // Function to convert country code to flag emoji
  const getCountryFlag = (countryName: string) => {
    const country = countriesData.find((c) => 
      c.name.toLowerCase() === countryName.toLowerCase()
    );
    if (!country) return null;
    return country.code
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    setIsPopupOpen(true);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(student.id);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer relative"
        onClick={handleCardClick}
      >
        <button
          onClick={handleHeartClick}
          disabled={isToggling}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
            isLiked(student.id)
              ? "bg-red-500 text-white shadow-lg"
              : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200"
          } ${isToggling ? "opacity-50" : ""}`}
        >
          <Heart className={`w-4 h-4 ${isLiked(student.id) ? "fill-current" : ""}`} />
        </button>

        <CardHeader className="text-center pb-3 px-4 sm:px-6">
          {student.profile_image ? (
            <img
              src={student.profile_image}
              alt={student.name || "Student"}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover border-3 border-red-100"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
              {student.name
                ? student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-center space-x-2 mb-1">
              {student.country && (
                <span className="flex items-center">
                  {getCountryFlag(student.country) ? (
                    <span className="text-base">{getCountryFlag(student.country)}</span>
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {student.name || "Unknown"}
              </h3>
            </div>
            {student.university && (
              <p className="text-sm text-gray-600 text-center mb-2">
                {student.university}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          {/* Current Project */}
          {student.current_project && (
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Project:</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {student.current_project}
              </p>
            </div>
          )}

          {/* Coolest Thing */}
          {student.coolest_thing && (
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Coolest Project:</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {student.coolest_thing}
              </p>
            </div>
          )}

          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {student.skills.slice(0, window.innerWidth < 640 ? 2 : 3).map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-xs bg-red-100 text-red-800 border-red-200"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {student.skills.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <span className="text-xs text-gray-500 self-center">
                    +{student.skills.length - (window.innerWidth < 640 ? 2 : 3)} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Courses */}
          {(student as any).courses && (student as any).courses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Courses</h4>
              <div className="flex flex-wrap gap-1">
                {(student as any).courses.map((course: string, index: number) => (
                  <Badge
                    key={`${course}-${index}`}
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summer Goals */}
          {(student as any).goals && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Summer Session Goals
              </h4>
              <p className="text-sm text-gray-600">
                {(student as any).goals}
              </p>
            </div>
          )}

          {/* Social Links */}
          {hasLinks && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {student.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('linkedin', student.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </a>
                  </Button>
                )}
                {student.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('github', student.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">GitHub</span>
                    </a>
                  </Button>
                )}
                {student.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs"
                    asChild
                  >
                    <a
                      href={student.website.startsWith('http') ? student.website : `https://${student.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Website</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StudentDetailPopup
        student={student}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};
