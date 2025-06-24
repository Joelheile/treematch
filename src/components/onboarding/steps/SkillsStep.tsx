"use client";

import { Badge } from "@/components/ui/badge";
import { FormData, Skill } from "../types";

interface SkillsStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  availableSkills: Skill[];
  skillsLoading: boolean;
}

export default function SkillsStep({
  formData,
  setFormData,
  availableSkills,
  skillsLoading,
}: SkillsStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          What are your skills?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
          Select the areas where you have experience or expertise. This
          helps others find you for the right projects.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-gray-200 mb-4 flex-shrink-0" />
        {skillsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              Loading skills...
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-wrap gap-2 sm:gap-3 px-1 pb-4">
              {availableSkills.map((skill) => {
                const isSelected = formData.skillIds.includes(skill.id);
                return (
                  <Badge
                    key={skill.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 min-h-[44px] touch-manipulation active:scale-95 ${
                      isSelected
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
                        : "hover:bg-red-50 hover:border-red-200 border-gray-300 bg-white"
                    }`}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        skillIds: isSelected
                          ? prev.skillIds.filter((id) => id !== skill.id)
                          : [...prev.skillIds, skill.id],
                      }));
                    }}
                  >
                    {skill.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 