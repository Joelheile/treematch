import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw, Users, Heart, TreePine, X } from "lucide-react";
import { Student, AVAILABLE_SKILLS, LOOKING_FOR_OPTIONS } from "@/types/Student";
import { StudentCard } from "@/components/StudentCard";
import { SwipeInterface } from "@/components/SwipeInterface";
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

interface StudentOverviewProps {
  students: Student[];
}

export const StudentOverview = ({ students }: StudentOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [lookingForFilter, setLookingForFilter] = useState("all");
  const [showSwipeMode, setShowSwipeMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.summerGoals.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.currentProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.lookingFor.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkillFilter = skillFilter === "all" || student.skills.includes(skillFilter);
      const matchesLookingForFilter = lookingForFilter === "all" || student.lookingFor.includes(lookingForFilter);
      
      const matchesSelectedSkills = selectedSkills.length === 0 || selectedSkills.some(skill => student.skills.includes(skill));
      const matchesSelectedLookingFor = selectedLookingFor.length === 0 || selectedLookingFor.some(item => student.lookingFor.includes(item));

      return matchesSearch && matchesSkillFilter && matchesLookingForFilter && matchesSelectedSkills && matchesSelectedLookingFor;
    });
  }, [students, searchTerm, skillFilter, lookingForFilter, selectedSkills, selectedLookingFor]);

  const handleSkillSelect = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleLookingForSelect = (item: string) => {
    setSelectedLookingFor(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSkillFilter("all");
    setLookingForFilter("all");
    setSelectedSkills([]);
    setSelectedLookingFor([]);
  };

  const hasActiveFilters = searchTerm || skillFilter !== "all" || lookingForFilter !== "all" || selectedSkills.length > 0 || selectedLookingFor.length > 0;

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, location, skills, projects, or goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Skill</label>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
              <SelectValue placeholder="All skills" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All skills</SelectItem>
              {AVAILABLE_SKILLS.map((skill) => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Looking For</label>
          <Select value={lookingForFilter} onValueChange={setLookingForFilter}>
            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
              <SelectValue placeholder="All options" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All options</SelectItem>
              {LOOKING_FOR_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Skill Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Select Multiple Skills</label>
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

      {/* Advanced Looking For Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Select Multiple Collaboration Types</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {LOOKING_FOR_OPTIONS.map((option) => (
            <Badge
              key={option}
              variant={selectedLookingFor.includes(option) ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedLookingFor.includes(option)
                  ? "bg-gray-900 hover:bg-black text-white"
                  : "hover:bg-gray-50 hover:border-gray-400 border-gray-300"
              }`}
              onClick={() => handleLookingForSelect(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
        {selectedLookingFor.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedLookingFor.map((item) => (
              <Badge key={item} className="bg-gray-200 text-gray-800 text-xs">
                {item}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleLookingForSelect(item)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (showSwipeMode) {
    return <SwipeInterface students={filteredStudents} onBack={() => setShowSwipeMode(false)} />;
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
                onClick={() => setShowSwipeMode(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Discover</span>
              </Button>
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

      {/* Enhanced Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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
              {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'} Found
            </h2>
             <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{students.length} total</span>
              </div>
          </div>

          {filteredStudents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p>Try adjusting your search terms or filters to find more matches</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
