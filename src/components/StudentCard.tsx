
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Target, Briefcase } from "lucide-react";
import { Student } from "@/types/Student";

interface StudentCardProps {
  student: Student;
}

export const StudentCard = ({ student }: StudentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200">
      <CardHeader className="text-center pb-3">
        {student.profileImage ? (
          <img
            src={student.profileImage}
            alt={student.name}
            className="w-20 h-20 rounded-full mx-auto object-cover border-3 border-red-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        )}
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
          <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {student.city}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Project */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            Current Project
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {student.currentProject}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {student.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs bg-red-100 text-red-800 border-red-200">
                {skill}
              </Badge>
            ))}
            {student.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{student.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Looking For */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Looking For</h4>
          <div className="flex flex-wrap gap-1">
            {student.lookingFor.slice(0, 2).map((item) => (
              <Badge key={item} variant="outline" className="text-xs border-gray-300 text-gray-700 hover:border-gray-400">
                {item}
              </Badge>
            ))}
            {student.lookingFor.length > 2 && (
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                +{student.lookingFor.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Semester Goals */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-1" />
            Semester Goals
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {student.summerGoals}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
