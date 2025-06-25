import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import countriesData from "@/lib/countries.json";
import {
  Calendar,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";

interface StudentDetailPopupProps {
  student: StudentWithSkills | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailPopup = ({
  student,
  isOpen,
  onClose,
}: StudentDetailPopupProps) => {
  if (!student) return null;

  const hasLinks = student.linkedin || student.github || student.website || student.instagram || student.twitter;

  // Function to convert country code to flag emoji
  const getCountryFlag = (countryName: string) => {
    const country = countriesData.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    if (!country) return null;
    return country.code
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {student.profile_image ? (
                <Image
                  src={student.profile_image}
                  alt={student.name || "Student"}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                  {student.name
                    ? student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {student.country && (
                  <span className="flex items-center">
                    {getCountryFlag(student.country) ? (
                      <span className="text-lg">
                        {getCountryFlag(student.country)}
                      </span>
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {student.name || "Unknown"}
                </h2>
                {student.is_first_mover_batch && (
                  <Image
                    src="/Trophy Icon 48.png"
                    alt="Trophy"
                    width={16}
                    height={16}
                    style={{ minWidth: 16, minHeight: 16 }}
                  />
                )}
              </div>

              {student.university && (
                <p className="text-sm text-gray-600 mb-3">
                  {student.university}
                </p>
              )}

              {/* Courses under university */}
              {(student as any).courses &&
                (student as any).courses.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {(student as any).courses.map(
                        (course: string, index: number) => (
                          <Badge
                            key={`${course}-${index}`}
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                          >
                            {course}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                {student.email && (
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <a href={`mailto:${student.email}`}>
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </a>
                  </Button>
                )}

                {student.phone_number && (
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <a href={`tel:${student.phone_number}`}>
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Current Project */}
          {student.current_project && (
            <div className="text-left mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Project:
              </h4>
              <p className="text-sm text-gray-600">{student.current_project}</p>
            </div>
          )}

          {/* Spacer */}
          {(student.current_project || student.coolest_thing || student.goals) && (
            <div className="border-t border-gray-100 my-4"></div>
          )}

          {/* Coolest Thing */}
          {student.coolest_thing && (
            <div className="text-left mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Most Proud Of:
              </h4>
              <p className="text-sm text-gray-600">{student.coolest_thing}</p>
            </div>
          )}

          {/* Spacer */}
          {student.coolest_thing && student.goals && (
            <div className="border-t border-gray-100 my-4"></div>
          )}

          {/* Summer Goals */}
          {student.goals && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Summer Goals:
              </h4>
              <p className="text-sm text-gray-600">{student.goals}</p>
            </div>
          )}

          {/* Skills at bottom - no headline */}
          {student.skills && student.skills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {student.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-xs bg-red-100 text-red-800 border-red-200"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links at bottom */}
          {hasLinks && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {student.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={`https://instagram.com/${student.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {student.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={`https://linkedin.com/in/${student.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {student.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={`https://github.com/${student.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {student.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={`https://twitter.com/${student.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {student.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={
                        student.website.startsWith("http")
                          ? student.website
                          : `https://${student.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {student.created_at && (
            <div className="flex items-center justify-center text-sm text-gray-500 pt-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Member since {new Date(student.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
