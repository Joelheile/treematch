import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Target,
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

  const hasLinks = student.linkedin || student.github || student.website;

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
                <img
                  src={student.profile_image}
                  alt={student.name || "Student"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                {student.name || "Unknown"}
                {student.is_first_mover_batch && (
                  <Image src="/Trophy Icon 48.png" alt="Trophy" width={16} height={16} style={{ minWidth: 16, minHeight: 16 }} />
                )}
              </h2>

              {student.country && (
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{student.country}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-red-600" />
                  Current Project
                </h3>
                {student.current_project ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {student.current_project}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No current project listed
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-red-600" />
                  Coolest Thing
                </h3>
                {student.coolest_thing ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {student.coolest_thing}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No coolest thing listed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {student.skills && student.skills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Skills ({student.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="text-sm bg-red-100 text-red-800 border-red-200 px-3 py-1"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {student.goals && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Looking For
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="text-sm border-gray-300 text-gray-700 hover:border-gray-400 px-3 py-1"
                  >
                    {student.goals}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {hasLinks && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Social Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  {student.linkedin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      asChild
                    >
                      <a
                        href={student.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {student.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      asChild
                    >
                      <a
                        href={student.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {student.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      asChild
                    >
                      <a
                        href={student.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {student.created_at && (
            <div className="flex items-center justify-center text-sm text-gray-500 pt-4 border-t border-gray-200">
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
