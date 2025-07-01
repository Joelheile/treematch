import { useAuth } from "@/app/auth/AuthProvider";
import { StudentCard } from "@/components/StudentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnboardingCompletion } from "@/hooks/useOnboardingCompletion";
import { useStudentLikes } from "@/integrations/supabase/useStudentLikes";
import type { StudentFilters } from "@/integrations/supabase/useStudents";
import { useStudents } from "@/integrations/supabase/useStudents";
import { useStudentSkillsFilter } from "@/integrations/supabase/useStudentSkillsFilter";
import countries from "@/lib/countries.json";
import {
  BookOpen,
  Check,
  ChevronDown,
  Coffee,
  Edit,
  ExternalLink,
  Github,
  Globe,
  Heart,
  Linkedin,
  Loader2,
  Search,
  Trophy,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import FloatingShareButton from "@/components/FloatingShareButton";
// import ReferralCTA from "@/components/referrals/ReferralCTA";

// Placeholder analytics hook since the original was undefined
const useStudentAnalytics = () => ({
  data: null,
  isLoading: false,
});

const SOCIAL_MEDIA_FILTERS = [
  { id: "hasLinkedIn", label: "LinkedIn", icon: Linkedin },
  { id: "hasGithub", label: "GitHub", icon: Github },
  { id: "hasWebsite", label: "Website", icon: ExternalLink },
];

const OTHER_FILTERS = [
  { id: "liked", label: "Liked", icon: Heart },
  {
    id: "engr145NoTeam",
    label: "Looking for Entrepreneurship Team",
    icon: Users2,
  },
];

export const StudentOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [socialMediaFilters, setSocialMediaFilters] = useState<{
    hasLinkedIn: boolean;
    hasGithub: boolean;
    hasWebsite: boolean;
  }>({
    hasLinkedIn: false,
    hasGithub: false,
    hasWebsite: false,
  });
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const [showEngr145WithoutTeam, setShowEngr145WithoutTeam] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isOnboardingComplete } = useOnboardingCompletion();
  const { data: skillsWithCounts = [] } = useStudentSkillsFilter();
  const { likedStudentIds } = useStudentLikes();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Function to convert country code to flag emoji
  const getCountryFlag = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  };

  const countryOptions = useMemo(() => {
    return countries.map((country) => ({
      value: country.name,
      label: country.name,
      flag: getCountryFlag(country.code),
      code: country.code,
    }));
  }, []);

  // Build filters object (without courses since we'll filter client-side)
  const filters: StudentFilters = useMemo(() => {
    const result: StudentFilters = {};
    if (searchTerm.trim()) result.search = searchTerm.trim();
    if (selectedCountry) result.country = selectedCountry;
    if (selectedSkillIds.length > 0) result.skillIds = selectedSkillIds;
    if (socialMediaFilters.hasLinkedIn) result.hasLinkedIn = true;
    if (socialMediaFilters.hasGithub) result.hasGithub = true;
    if (socialMediaFilters.hasWebsite) result.hasWebsite = true;
    if (showLiked && user?.id) result.likedByUserId = user.id;
    if (showEngr145WithoutTeam) result.hasEngr145Team = false;
    return result;
  }, [
    searchTerm,
    selectedCountry,
    selectedSkillIds,
    socialMediaFilters,
    showLiked,
    showEngr145WithoutTeam,
    user?.id,
  ]);

  // Fetch students with filters
  const {
    data: studentsResponse,
    isLoading,
    error,
    refetch,
  } = useStudents({
    filters,
    limit: 50,
    orderBy: "created_at",
    orderDirection: "desc",
  });

  // Wrap allStudents in useMemo to avoid dependency issues
  const allStudents = useMemo(() => {
    return studentsResponse?.data || [];
  }, [studentsResponse?.data]);

  // Client-side course filtering
  const students = useMemo(() => {
    let filteredStudents = allStudents;

    // Apply course filters
    if (selectedCourses.length > 0) {
      filteredStudents = filteredStudents.filter((student) => {
        const studentCourses = (student as any).courses || [];
        return selectedCourses.some((selectedCourse) =>
          studentCourses.some((course: string) =>
            course.toLowerCase().includes(selectedCourse.toLowerCase())
          )
        );
      });
    }

    // Apply ENGR145 without team filter
    if (showEngr145WithoutTeam) {
      filteredStudents = filteredStudents.filter((student) => {
        const studentCourses = (student as any).courses || [];
        return studentCourses.some((course: string) =>
          course.toLowerCase().includes("engr145")
        );
      });
    }

    return filteredStudents;
  }, [allStudents, selectedCourses, showEngr145WithoutTeam]);

  const totalCount = students.length;

  // Get unique countries from actual students
  const availableCountries = useMemo(() => {
    const countrySet = new Set<string>();
    students.forEach((student) => {
      if (student.country) {
        countrySet.add(student.country);
      }
    });
    return Array.from(countrySet).sort();
  }, [students]);

  // Get unique courses from all students
  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>();
    allStudents.forEach((student) => {
      const studentCourses = (student as any).courses || [];
      studentCourses.forEach((course: string) => {
        if (course && course.trim()) {
          courseSet.add(course.trim());
        }
      });
    });
    return Array.from(courseSet).sort();
  }, [allStudents]);

  const handleSkillSelect = (skillName: string) => {
    const skill = skillsWithCounts.find((s) => s.name === skillName);
    if (!skill) return;

    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
    setSelectedSkillIds((prev) =>
      prev.includes(skill.id)
        ? prev.filter((id) => id !== skill.id)
        : [...prev, skill.id]
    );
  };

  const handleCourseSelect = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  const handleSocialMediaFilter = (filterType: string) => {
    setSocialMediaFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType as keyof typeof prev],
    }));
  };

  const handleQuickFilter = (filterType: string) => {
    if (filterType === "liked") {
      setShowLiked((prev) => !prev);
    } else if (filterType === "engr145NoTeam") {
      setShowEngr145WithoutTeam((prev) => !prev);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedSkills([]);
    setSelectedSkillIds([]);
    setSelectedCourses([]);
    setSocialMediaFilters({
      hasLinkedIn: false,
      hasGithub: false,
      hasWebsite: false,
    });
    setShowLiked(false);
    setShowEngr145WithoutTeam(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCountry ||
    selectedSkills.length > 0 ||
    selectedCourses.length > 0 ||
    Object.values(socialMediaFilters).some(Boolean) ||
    showLiked ||
    showEngr145WithoutTeam;

  const activeSocialFilters =
    Object.values(socialMediaFilters).filter(Boolean).length;
  const activeFilterCount =
    [
      searchTerm,
      selectedCountry,
      selectedSkillIds.length > 0,
      selectedCourses.length > 0,
      activeSocialFilters > 0,
      showLiked,
      showEngr145WithoutTeam,
    ].filter(Boolean).length +
    selectedSkillIds.length +
    selectedCourses.length +
    activeSocialFilters -
    (selectedSkillIds.length > 0 ? 1 : 0) -
    (selectedCourses.length > 0 ? 1 : 0) -
    (activeSocialFilters > 0 ? 1 : 0);

  // Focus search on mobile when component mounts
  useEffect(() => {
    if (isMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobile]);

  const renderMobileSearch = () => (
    <div className="relative">
      <div
        className={`transition-all duration-300 ${
          searchFocused
            ? "bg-white shadow-lg rounded-2xl border-2 border-red-500"
            : "bg-gray-50 rounded-2xl border border-gray-200"
        }`}
      >
        <div className="flex items-center px-4 py-3">
          <Search
            className={`w-5 h-5 mr-3 transition-colors ${
              searchFocused ? "text-red-500" : "text-gray-400"
            }`}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search students, skills, interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="ml-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuickFilters = () => (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {/* Country filter */}
      <Popover open={showCountryDropdown} onOpenChange={setShowCountryDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-colors ${
              selectedCountry
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">
              {selectedCountry
                ? `${
                    countryOptions.find((c) => c.value === selectedCountry)
                      ?.flag
                  } ${selectedCountry}`
                : "Country"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSelectedCountry("");
                    setShowCountryDropdown(false);
                  }}
                >
                  <span>🌍 All Countries</span>
                </CommandItem>
                {availableCountries.map((country) => {
                  const countryOption = countryOptions.find(
                    (c) => c.value === country
                  );
                  return (
                    <CommandItem
                      key={country}
                      onSelect={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <span>
                        {countryOption?.flag} {country}
                      </span>
                      {selectedCountry === country && (
                        <Check className="ml-auto w-4 h-4 text-red-600" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Social Media Filters Dropdown */}
      <Popover open={showSocialDropdown} onOpenChange={setShowSocialDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-colors relative ${
              activeSocialFilters > 0
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Social Links
            </span>
            <span className="text-xs sm:text-sm font-medium sm:hidden">
              Social
            </span>
            {activeSocialFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeSocialFilters}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700 mb-3">
              Show students with:
            </div>
            {SOCIAL_MEDIA_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isChecked =
                socialMediaFilters[
                  filter.id as keyof typeof socialMediaFilters
                ];

              return (
                <label
                  key={filter.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSocialMediaFilter(filter.id)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <Icon className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{filter.label}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Other Quick Filters */}
      {OTHER_FILTERS.map((filter) => {
        const isActive =
          (filter.id === "liked" && showLiked) ||
          (filter.id === "engr145NoTeam" && showEngr145WithoutTeam);
        const Icon = filter.icon;

        return (
          <button
            key={filter.id}
            onClick={() => handleQuickFilter(filter.id)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-colors ${
              isActive
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">
              {filter.label}
            </span>
          </button>
        );
      })}

      {/* Skills filter */}
      <Popover open={showSkillsDropdown} onOpenChange={setShowSkillsDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-colors relative ${
              selectedSkills.length > 0
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Skills</span>
            {selectedSkillIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {selectedSkillIds.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 max-h-96 overflow-hidden">
          <Command>
            <CommandInput placeholder="Search skills..." />
            <CommandList>
              <CommandEmpty>No skills found.</CommandEmpty>

              {selectedSkills.length > 0 && (
                <CommandGroup>
                  {selectedSkills.map((skillName) => (
                    <CommandItem
                      key={skillName}
                      onSelect={() => handleSkillSelect(skillName)}
                      className="bg-red-50"
                    >
                      <span className="text-red-700 font-medium">
                        {skillName}
                      </span>
                      <Check className="ml-auto w-4 h-4 text-red-600" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {skillsWithCounts.length > 0 && (
                <CommandGroup>
                  {skillsWithCounts
                    .filter((skill) => !selectedSkills.includes(skill.name))
                    .map((skill) => (
                      <CommandItem
                        key={skill.id}
                        onSelect={() => handleSkillSelect(skill.name)}
                      >
                        <span>
                          {skill.name} ({skill.student_count})
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Courses filter */}
      <Popover open={showCoursesDropdown} onOpenChange={setShowCoursesDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-colors relative ${
              selectedCourses.length > 0
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Courses</span>
            {selectedCourses.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {selectedCourses.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 max-h-96 overflow-hidden">
          <Command>
            <CommandInput placeholder="Search courses..." />
            <CommandList>
              <CommandEmpty>No courses found.</CommandEmpty>

              {selectedCourses.length > 0 && (
                <CommandGroup>
                  {selectedCourses.map((courseName) => (
                    <CommandItem
                      key={courseName}
                      onSelect={() => handleCourseSelect(courseName)}
                      className="bg-blue-50"
                    >
                      <span className="text-blue-700 font-medium">
                        {courseName}
                      </span>
                      <Check className="ml-auto w-4 h-4 text-blue-600" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {availableCourses.length > 0 && (
                <CommandGroup>
                  {availableCourses
                    .filter((course) => !selectedCourses.includes(course))
                    .map((course) => (
                      <CommandItem
                        key={course}
                        onSelect={() => handleCourseSelect(course)}
                      >
                        <span>{course}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-gray-600 shrink-0">
            Active:
          </span>

          {searchTerm && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Search className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">
                "{searchTerm}"
              </span>
              <button onClick={() => setSearchTerm("")} className="ml-1">
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </div>
          )}

          {selectedCountry && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              <Globe className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">
                {selectedCountry}
              </span>
              <button onClick={() => setSelectedCountry("")} className="ml-1">
                <X className="w-3 h-3 hover:text-green-900" />
              </button>
            </div>
          )}

          {selectedSkills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200"
            >
              <span className="text-xs sm:text-sm font-medium">{skill}</span>
              <button onClick={() => handleSkillSelect(skill)} className="ml-1">
                <X className="w-3 h-3 hover:text-purple-900" />
              </button>
            </div>
          ))}

          {selectedCourses.map((course) => (
            <div
              key={course}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
            >
              <span className="text-xs sm:text-sm font-medium">{course}</span>
              <button
                onClick={() => handleCourseSelect(course)}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </div>
          ))}

          {socialMediaFilters.hasLinkedIn && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Linkedin className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">
                Has LinkedIn
              </span>
              <button
                onClick={() => handleSocialMediaFilter("hasLinkedIn")}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </div>
          )}

          {socialMediaFilters.hasGithub && (
            <div className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
              <Github className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">Has GitHub</span>
              <button
                onClick={() => handleSocialMediaFilter("hasGithub")}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-gray-900" />
              </button>
            </div>
          )}

          {socialMediaFilters.hasWebsite && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              <ExternalLink className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">
                Has Website
              </span>
              <button
                onClick={() => handleSocialMediaFilter("hasWebsite")}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-green-900" />
              </button>
            </div>
          )}

          {showLiked && (
            <div className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
              <Heart className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">Liked</span>
              <button onClick={() => setShowLiked(false)} className="ml-1">
                <X className="w-3 h-3 hover:text-red-900" />
              </button>
            </div>
          )}

          {showEngr145WithoutTeam && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
              <Users2 className="w-3 h-3" />
              <span className="text-xs sm:text-sm font-medium">
                Looking for Entrepreneurship Team
              </span>
              <button
                onClick={() => setShowEngr145WithoutTeam(false)}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-orange-900" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition-colors shrink-0 self-start sm:self-center"
        >
          <X className="w-3 h-3" />
          <span className="text-xs sm:text-sm font-medium">Clear All</span>
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Failed to load students
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1 rounded-xl">
                <Image
                  src="/logo.png"
                  alt="TreeMatch Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Treematch</h1>
                <p className="text-gray-500 text-sm hidden sm:block">
                  Connect with Stanford students
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="https://coff.ee/treematch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">Buy us a coffee</span>
                <span className="sm:hidden">Coffee</span>
              </a>
              <Link href="/referrals">
                <Button className="flex items-center gap-2 bg-stanford-red-50 text-stanford-cardinal hover:bg-stanford-red-100 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 border-0">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Leaderboard</span>
                  <span className="sm:hidden">Board</span>
                </Button>
              </Link>
              <Link href="/edit">
                <Button className={`flex items-center space-x-2 rounded-xl ${
                  isOnboardingComplete 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-orange-600 hover:bg-orange-700"
                }`}>
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isOnboardingComplete ? "Edit Profile" : "Complete Onboarding"}
                  </span>
                  <span className="sm:hidden">
                    {isOnboardingComplete ? "Edit" : "Complete"}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Mobile-first search */}
        {renderMobileSearch()}

        {/* Quick filters */}
        {renderQuickFilters()}

        {/* Active filters */}
        {renderActiveFilters()}

        {/* Referral CTA */}
        {/* <ReferralCTA /> */}

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                `${students.length} Student${students.length !== 1 ? "s" : ""}`
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : students.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p>
                  Try adjusting your search terms or filters to find more
                  matches
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
