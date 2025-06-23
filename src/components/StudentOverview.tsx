
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw, Users } from "lucide-react";
import { Student, AVAILABLE_SKILLS, LOOKING_FOR_OPTIONS } from "@/types/Student";
import { StudentCard } from "@/components/StudentCard";

interface StudentOverviewProps {
  students: Student[];
  onReset: () => void;
}

export const StudentOverview = ({ students, onReset }: StudentOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [lookingForFilter, setLookingForFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.summerGoals.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkill = skillFilter === "all" || student.skills.includes(skillFilter);
      const matchesLookingFor = lookingForFilter === "all" || student.lookingFor.includes(lookingForFilter);

      return matchesSearch && matchesSkill && matchesLookingFor;
    });
  }, [students, searchTerm, skillFilter, lookingForFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stanford Summer Connect</h1>
              <p className="text-gray-600 mt-1">Find your perfect study and project partners</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{students.length} students</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Search & Filter</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, city, goals, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Skill</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'} Found
            </h2>
            {(searchTerm || skillFilter !== "all" || lookingForFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSkillFilter("all");
                  setLookingForFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p>Try adjusting your search terms or filters</p>
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
