import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useStudentLikes } from "@/integrations/supabase/useStudentLikes";
import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import countriesData from "@/lib/countries.json";
import {
  ExternalLink,
  Github,
  Heart,
  Instagram,
  Linkedin,
  MapPin,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { StudentDetailPopup } from "./StudentDetailPopup";
import { ICON_OPTIONS } from './onboarding/types'

interface StudentCardProps {
  student: StudentWithSkills;
}

export const StudentCard = ({ student }: StudentCardProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isLiked, toggleLike, isToggling } = useStudentLikes();
  const hasLinks =
    student.linkedin ||
    student.github ||
    student.website ||
    student.instagram ||
    student.twitter;

  // Check if this is a builder card (has goat emoji)
  const isBuilder = student.icon === "goat";

  // Helper function to format social media URLs
  const formatSocialUrl = (platform: string, username: string) => {
    if (!username) return "";

    // Remove any existing URL prefixes
    const cleanUsername = username
      .replace(
        /^https?:\/\/(www\.)?(linkedin\.com\/in\/|github\.com\/|instagram\.com\/)?/,
        ""
      )
      .replace(/\/$/, "");

    switch (platform) {
      case "linkedin":
        return `https://linkedin.com/in/${cleanUsername}`;
      case "github":
        return `https://github.com/${cleanUsername}`;
      case "instagram":
        return `https://instagram.com/${cleanUsername}`;
      default:
        return cleanUsername.startsWith("http")
          ? cleanUsername
          : `https://${cleanUsername}`;
    }
  };

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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
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
        className={`h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
          isBuilder 
            ? "border-red-300" 
            : "border border-gray-200"
        } cursor-pointer relative bg-white`}
        onClick={handleCardClick}
      >
        <button
          onClick={handleHeartClick}
          disabled={isToggling}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors duration-75 active:scale-95 ${
            isLiked(student.id)
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200"
          } ${isToggling ? "opacity-60" : ""}`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-75 ${isLiked(student.id) ? "fill-current" : ""}`}
          />
        </button>

        <CardHeader className="text-center pb-3 px-4 sm:px-6">
          {student.profile_image ? (
            <Image
              src={student.profile_image}
              alt={student.name || "Student"}
              width={80}
              height={80}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover ${
                isBuilder ? "border-2 border-red-400" : "border-3 border-red-100"
              }`}
              loading="lazy"
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
              {student.icon && (
                (() => {
                  const found = ICON_OPTIONS.find(opt => opt.value === student.icon)
                  return found ? <span style={{ fontSize: 16 }}>{found.emoji}</span> : <span style={{ fontSize: 16 }}>{student.icon}</span>
                })()
              )}
              {student.country && (
                <span className="flex items-center">
                  {getCountryFlag(student.country) ? (
                    <span className="text-base">
                      {getCountryFlag(student.country)}
                    </span>
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
            {/* Courses under university */}
            {(student as any).courses &&
              (student as any).courses.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap justify-center gap-1">
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
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6">
          {/* Coolest Thing */}
          {student.coolest_thing && (
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                What's your thing/story/passion?
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {student.coolest_thing}
              </p>
            </div>
          )}
          {/* Spacer */}
          {student.coolest_thing && (student as any).goals && (
            <div className="border-t border-gray-100 my-3"></div>
          )}
          {/* Summer Goals */}
          {(student as any).goals && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Why Stanford & Goals:
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {(student as any).goals}
              </p>
            </div>
          )}
          <div className="flex-1"></div>
          {/* Skills at bottom */}
          {student.skills && student.skills.length > 0 && (
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1">
                {student.skills
                  .slice(0, window.innerWidth < 640 ? 2 : 3)
                  .map((skill) => (
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
                    +{student.skills.length - (window.innerWidth < 640 ? 2 : 3)}{" "}
                    more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Social Links at bottom */}
          {hasLinks && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {student.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    asChild
                  >
                    <a
                      href={formatSocialUrl("instagram", student.instagram)}
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
                      href={formatSocialUrl("linkedin", student.linkedin)}
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
                      href={formatSocialUrl("github", student.github)}
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
