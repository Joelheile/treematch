"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { FormData } from "../types";

interface CoursesStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  availableCourses: never[];
  coursesLoading: boolean;
  onNext?: () => void;
}

export default function CoursesStep({
  formData,
  setFormData,
}: CoursesStepProps) {
  const [courseInput, setCourseInput] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedInput = courseInput.trim().toUpperCase();
      if (trimmedInput && !formData.courses.includes(trimmedInput)) {
        setFormData((prev) => ({
          ...prev,
          courses: [...prev.courses, trimmedInput],
        }));
        setCourseInput("");
      }
    }
  };

  const removeCourse = (courseToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course !== courseToRemove),
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          What courses have you taken?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
          Enter course codes (like CS229, ENGR145) and press Enter to add them. You can add multiple courses.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="w-full max-w-2xl px-2 space-y-6">
          <Input
            type="text"
            placeholder="Enter course code and press Enter"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full text-lg py-4"
            autoFocus
          />
          
          {formData.courses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center">
                Added Courses ({formData.courses.length})
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {formData.courses.map((course) => (
                  <Badge
                    key={course}
                    variant="secondary"
                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 px-3 py-1 text-sm flex items-center gap-2"
                  >
                    {course}
                    <button
                      onClick={() => removeCourse(course)}
                      className="hover:text-red-900 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {formData.courses.length === 0 && (
            <p className="text-gray-500 text-sm text-center italic">
              No courses added yet. Start by entering a course code above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}