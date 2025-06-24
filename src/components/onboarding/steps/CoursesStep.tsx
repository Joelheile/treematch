"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
  onNext,
}: CoursesStepProps) {
  const [courseInput, setCourseInput] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedInput = courseInput.trim().toUpperCase();
      if (trimmedInput) {
        setFormData((prev) => ({
          ...prev,
          courseIds: [...prev.courseIds, trimmedInput],
        }));
        setCourseInput("");
        if (onNext) {
          onNext();
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          What courses have you taken?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
          Enter a course code (like CS229, ENGR145) and press Enter to continue.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="w-full max-w-md px-2">
          <Input
            type="text"
            placeholder="Enter course code and press Enter"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full text-lg py-4"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}