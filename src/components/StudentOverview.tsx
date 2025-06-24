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
import { useSkills } from "@/integrations/supabase/useSkills";
import type { StudentFilters } from "@/integrations/supabase/useStudents";
import { useStudents } from "@/integrations/supabase/useStudents";
import countries from "@/lib/countries.json";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Github,
  Linkedin,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  TreePine,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// Placeholder analytics hook since the original was undefined
const useStudentAnalytics = () => ({
  data: null,
  isLoading: false,
});

const QUICK_FILTERS = [
  { id: "hasLinkedIn", label: "Has LinkedIn", icon: Linkedin },
  { id: "hasGithub", label: "Has GitHub", icon: Github },
];

export const StudentOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hasLinkedIn, setHasLinkedIn] = useState<boolean | undefined>(
    undefined
  );
  const [hasGithub, setHasGithub] = useState<boolean | undefined>(undefined);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "alphabetical" | "mostSkills"
  >("newest");

  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: skills = [] } = useSkills(user?.id);
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

  // Build filters object
  const filters: StudentFilters = useMemo(() => {
    const result: StudentFilters = {};
    if (searchTerm.trim()) result.search = searchTerm.trim();
    if (selectedCountry) result.country = selectedCountry;
    if (selectedSkills.length > 0) result.skillIds = selectedSkills;
    if (hasLinkedIn !== undefined) result.hasLinkedIn = hasLinkedIn;
    if (hasGithub !== undefined) result.hasGithub = hasGithub;
    return result;
  }, [searchTerm, selectedCountry, selectedSkills, hasLinkedIn, hasGithub]);

  // Fetch students with filters
  const {
    data: studentsResponse,
    isLoading,
    error,
    refetch,
  } = useStudents({
    filters,
    limit: 50,
    orderBy:
      sortBy === "newest"
        ? "created_at"
        : sortBy === "alphabetical"
        ? "name"
        : "created_at",
    orderDirection: sortBy === "newest" ? "desc" : "asc",
  });

  const students = studentsResponse?.data || [];
  const totalCount = studentsResponse?.totalCount || 0;

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

  const handleSkillSelect = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case "hasLinkedIn":
        setHasLinkedIn((prev) => (prev === true ? undefined : true));
        break;
      case "hasGithub":
        setHasGithub((prev) => (prev === true ? undefined : true));
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedSkills([]);
    setHasLinkedIn(undefined);
    setHasGithub(undefined);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCountry ||
    selectedSkills.length > 0 ||
    hasLinkedIn !== undefined ||
    hasGithub !== undefined;

  const activeFilterCount =
    [
      searchTerm,
      selectedCountry,
      selectedSkills.length > 0,
      hasLinkedIn !== undefined,
      hasGithub !== undefined,
    ].filter(Boolean).length +
    selectedSkills.length -
    (selectedSkills.length > 0 ? 1 : 0);

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
            placeholder="Search students, skills, projects..."
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
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* Sort button */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-300 hover:border-gray-400 transition-colors whitespace-nowrap">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {sortBy === "newest"
                ? "Newest"
                : sortBy === "alphabetical"
                ? "A-Z"
                : "Most Skills"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            {[
              { value: "newest", label: "Newest First" },
              { value: "alphabetical", label: "Alphabetical" },
              { value: "mostSkills", label: "Most Skills" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  sortBy === option.value
                    ? "bg-red-50 text-red-700"
                    : "hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Country filter */}
      <Popover open={showCountryDropdown} onOpenChange={setShowCountryDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
              selectedCountry
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
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

      {/* Quick social filters */}
      {QUICK_FILTERS.map((filter) => {
        const isActive =
          (filter.id === "hasLinkedIn" && hasLinkedIn) ||
          (filter.id === "hasGithub" && hasGithub);
        const Icon = filter.icon;

        return (
          <button
            key={filter.id}
            onClick={() => handleQuickFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
              isActive
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{filter.label}</span>
          </button>
        );
      })}

      {/* Skills filter */}
      <Popover open={showSkillsDropdown} onOpenChange={setShowSkillsDropdown}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors whitespace-nowrap relative ${
              selectedSkills.length > 0
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Skills</span>
            {selectedSkills.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {selectedSkills.length}
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
                <CommandGroup heading="Selected Skills">
                  {selectedSkills.map((skillName) => (
                    <CommandItem
                      key={skillName}
                      onSelect={() => handleSkillSelect(skillName)}
                      className="bg-red-50"
                    >
                      <span className="text-red-700 font-medium">{skillName}</span>
                      <Check className="ml-auto w-4 h-4 text-red-600" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {skills.length > 0 && (
                <CommandGroup heading="Available Skills">
                  {skills
                    .filter((skill) => !selectedSkills.includes(skill.name))
                    .map((skill) => (
                      <CommandItem
                        key={skill.id}
                        onSelect={() => handleSkillSelect(skill.name)}
                      >
                        <span>{skill.name}</span>
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Active:
          </span>

          {searchTerm && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Search className="w-3 h-3" />
              <span className="text-sm font-medium">"{searchTerm}"</span>
              <button onClick={() => setSearchTerm("")} className="ml-1">
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </div>
          )}

          {selectedCountry && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              <MapPin className="w-3 h-3" />
              <span className="text-sm font-medium">{selectedCountry}</span>
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
              <span className="text-sm font-medium">{skill}</span>
              <button onClick={() => handleSkillSelect(skill)} className="ml-1">
                <X className="w-3 h-3 hover:text-purple-900" />
              </button>
            </div>
          ))}

          {hasLinkedIn && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Linkedin className="w-3 h-3" />
              <span className="text-sm font-medium">Has LinkedIn</span>
              <button
                onClick={() => setHasLinkedIn(undefined)}
                className="ml-1"
              >
                <X className="w-3 h-3 hover:text-blue-900" />
              </button>
            </div>
          )}

          {hasGithub && (
            <div className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
              <Github className="w-3 h-3" />
              <span className="text-sm font-medium">Has GitHub</span>
              <button onClick={() => setHasGithub(undefined)} className="ml-1">
                <X className="w-3 h-3 hover:text-gray-900" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
        >
          <X className="w-3 h-3" />
          <span className="text-sm font-medium">Clear All</span>
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
              <div className="bg-red-600 p-2 rounded-xl">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Treematch</h1>
                <p className="text-gray-500 text-sm hidden sm:block">
                  Connect with Stanford students
                </p>
              </div>
            </div>
            {/* <Link href="/meet" passHref>
              <Button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 rounded-xl">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Meet in Person</span>
                <span className="sm:hidden">Meet</span>
              </Button>
            </Link> */}
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
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalCount} total</span>
            </div>
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
