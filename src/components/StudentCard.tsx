import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import {
  Briefcase,
  ExternalLink,
  Github,
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
  const hasLinks = student.linkedin || student.github || student.website;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    setIsPopupOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="text-center pb-3">
          {student.profile_image ? (
            <img
              src={student.profile_image}
              alt={student.name || "Student"}
              className="w-20 h-20 rounded-full mx-auto object-cover border-3 border-red-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
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
            <h3 className="text-lg font-semibold text-gray-900">
              {student.name || "Unknown"}
            </h3>
            {student.country && (
              <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {student.country}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Project */}
          {student.current_project && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                Current Project
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {student.current_project}
              </p>
            </div>
          )}

          {/* Coolest Thing */}
          {student.coolest_thing && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Coolest Thing
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {student.coolest_thing}
              </p>
            </div>
          )}

          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {student.skills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-xs bg-red-100 text-red-800 border-red-200"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {student.skills.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    +{student.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Summer Goals */}
          {student.summer_goals && student.summer_goals.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Looking For
              </h4>
              <div className="flex flex-wrap gap-1">
                {student.summer_goals.slice(0, 2).map((goal) => (
                  <Badge
                    key={goal}
                    variant="outline"
                    className="text-xs border-gray-300 text-gray-700 hover:border-gray-400"
                  >
                    {goal}
                  </Badge>
                ))}
                {student.summer_goals.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-200 text-gray-600"
                  >
                    +{student.summer_goals.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {hasLinks && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {student.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    asChild
                  >
                    <a
                      href={student.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-3 h-3 mr-1" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {student.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    asChild
                  >
                    <a
                      href={student.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-3 h-3 mr-1" />
                      GitHub
                    </a>
                  </Button>
                )}
                {student.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    asChild
                  >
                    <a
                      href={student.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Website
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
