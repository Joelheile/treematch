import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, TreePine, X, Loader2, BarChart3, Globe2, Award } from "lucide-react";
import { AVAILABLE_SKILLS, LOOKING_FOR_OPTIONS } from "@/types/Student";
import { StudentCard } from "@/components/StudentCard";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  useStudents, 
  useStudentAnalytics, 
  useInfiniteStudents 
} from "@/integrations/supabase/student-queries";
import type { StudentFilters } from "@/integrations/supabase/student-service";

export const StudentOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hasLinkedIn, setHasLinkedIn] = useState<boolean | undefined>(undefined);
  const [hasGithub, setHasGithub] = useState<boolean | undefined>(undefined);
  const [hasWebsite, setHasWebsite] = useState<boolean | undefined>(undefined);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const isMobile = useIsMobile();

  // Build filters object
  const filters: StudentFilters = useMemo(() => {
    const result: StudentFilters = {};
    
    if (searchTerm.trim()) result.search = searchTerm.trim();
    if (selectedCountry) result.country = selectedCountry;
    if (selectedSkills.length > 0) result.skills = selectedSkills;
    if (hasLinkedIn !== undefined) result.hasLinkedIn = hasLinkedIn;
    if (hasGithub !== undefined) result.hasGithub = hasGithub;
    if (hasWebsite !== undefined) result.hasWebsite = hasWebsite;
    
    return result;
  }, [searchTerm, selectedCountry, selectedSkills, hasLinkedIn, hasGithub, hasWebsite]);

  // Fetch students with filters
  const { 
    data: studentsResponse, 
    isLoading, 
    error,
    refetch 
  } = useStudents(filters, {
    limit: 50,
    orderBy: 'created_at',
    orderDirection: 'desc'
  });

  // Fetch analytics
  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useStudentAnalytics();

  const students = studentsResponse?.data || [];
  const totalCount = studentsResponse?.totalCount || 0;

  const handleSkillSelect = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedSkills([]);
    setHasLinkedIn(undefined);
    setHasGithub(undefined);
    setHasWebsite(undefined);
  };

  const hasActiveFilters = searchTerm || selectedCountry || selectedSkills.length > 0 || 
    hasLinkedIn !== undefined || hasGithub !== undefined || hasWebsite !== undefined;

  const uniqueCountries = useMemo(() => {
    if (!analytics?.data?.studentsByCountry) return [];
    return Object.keys(analytics.data.studentsByCountry).sort();
  }, [analytics]);

  const renderAnalytics = () => {
    if (!analytics?.data) return null;

    const { totalStudents, studentsByCountry, topSkills, studentsWithSocialLinks } = analytics.data;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(studentsByCountry).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Social Links</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithSocialLinks}</div>
            <div className="text-xs text-muted-foreground">
              {totalStudents > 0 ? Math.round((studentsWithSocialLinks / totalStudents) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skill</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSkills[0]?.skill || "None"}</div>
            <div className="text-xs text-muted-foreground">
              {topSkills[0]?.count || 0} students
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, project, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
        />
      </div>

             {/* Country Filter */}
       <div>
         <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Country</label>
         <Select value={selectedCountry || "all"} onValueChange={(value) => setSelectedCountry(value === "all" ? "" : value)}>
           <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
             <SelectValue placeholder="All countries" />
           </SelectTrigger>
           <SelectContent className="bg-white max-h-60">
             <SelectItem value="all">All countries</SelectItem>
             {uniqueCountries.map((country) => (
               <SelectItem key={country} value={country}>
                 {country} ({analytics?.data?.studentsByCountry[country] || 0})
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>

             {/* Social Media Filters */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div>
           <label className="text-sm font-medium text-gray-700 mb-2 block">LinkedIn</label>
           <Select 
             value={hasLinkedIn === undefined ? "any" : hasLinkedIn.toString()} 
             onValueChange={(value) => setHasLinkedIn(value === "any" ? undefined : value === "true")}
           >
             <SelectTrigger>
               <SelectValue placeholder="Any" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="any">Any</SelectItem>
               <SelectItem value="true">Has LinkedIn</SelectItem>
               <SelectItem value="false">No LinkedIn</SelectItem>
             </SelectContent>
           </Select>
         </div>
         <div>
           <label className="text-sm font-medium text-gray-700 mb-2 block">GitHub</label>
           <Select 
             value={hasGithub === undefined ? "any" : hasGithub.toString()} 
             onValueChange={(value) => setHasGithub(value === "any" ? undefined : value === "true")}
           >
             <SelectTrigger>
               <SelectValue placeholder="Any" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="any">Any</SelectItem>
               <SelectItem value="true">Has GitHub</SelectItem>
               <SelectItem value="false">No GitHub</SelectItem>
             </SelectContent>
           </Select>
         </div>
         <div>
           <label className="text-sm font-medium text-gray-700 mb-2 block">Website</label>
           <Select 
             value={hasWebsite === undefined ? "any" : hasWebsite.toString()} 
             onValueChange={(value) => setHasWebsite(value === "any" ? undefined : value === "true")}
           >
             <SelectTrigger>
               <SelectValue placeholder="Any" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="any">Any</SelectItem>
               <SelectItem value="true">Has Website</SelectItem>
               <SelectItem value="false">No Website</SelectItem>
             </SelectContent>
           </Select>
         </div>
       </div>

      {/* Skills Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Filter by Skills</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {AVAILABLE_SKILLS.map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedSkills.includes(skill)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "hover:bg-red-50 hover:border-red-200 border-gray-300"
              }`}
              onClick={() => handleSkillSelect(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedSkills.map((skill) => (
              <Badge key={skill} className="bg-red-100 text-red-800 text-xs">
                {skill}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleSkillSelect(skill)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load students</h3>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Treematch</h1>
                <p className="text-gray-500 text-sm hidden md:block">Connect with Stanford students</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="hidden md:flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
              <Link href="/meet" passHref>
                <Button
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Meet in Person</span>
                </Button>
              </Link>
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Filter className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Find your perfect match.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                      {renderFilters()}
                    </div>
                    <SheetFooter className="mt-auto pt-4">
                      <div className="flex justify-between w-full items-center">
                        <Button
                          variant="ghost"
                          onClick={clearAllFilters}
                          className="text-red-600 hover:text-red-700 px-2"
                        >
                          Clear All
                        </Button>
                        <SheetClose asChild>
                          <Button>Apply Filters</Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Analytics */}
        {showAnalytics && !analyticsLoading && renderAnalytics()}

        {/* Filters */}
        {!isMobile ? (
           <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold">Filter and Sort</h2>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllFilters();
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear All Filters
                      </Button>
                    )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    {renderFilters()}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading students...</span>
                </div>
              ) : (
                `${students.length} ${students.length === 1 ? 'Student' : 'Students'} Found`
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
                <p>Try adjusting your search terms or filters to find more matches</p>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
