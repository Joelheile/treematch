"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { FormData, Skill } from "../types";

interface SkillsStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  availableSkills: Skill[];
  suggestedSkills: Skill[];
  skillsLoading: boolean;
  suggestedSkill: string;
  setSuggestedSkill: (value: string) => void;
  handleSuggestSkill: () => void;
}

export default function SkillsStep({
  formData,
  setFormData,
  availableSkills,
  suggestedSkills,
  skillsLoading,
  suggestedSkill,
  setSuggestedSkill,
  handleSuggestSkill,
}: SkillsStepProps) {
  const allSkills = [...availableSkills, ...suggestedSkills];

  const handleSkillToggle = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  const handleSuggestSkillWithEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestedSkill.trim()) {
      e.preventDefault();
      handleSuggestSkill();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          What are your skills?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
          Select the areas where you have experience or expertise. This helps
          others find you for the right projects.
        </p>
        <p className="text-gray-500 text-xs sm:text-sm px-2 mt-1">
          Select at least one skill to continue.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-gray-200 mb-4 flex-shrink-0" />
        {skillsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">Loading skills...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-wrap gap-2 sm:gap-3 px-1 pb-4 pt-4">
              {allSkills.map((skill) => {
                const isSelected = formData.skillIds.includes(skill.id);
                const isSuggested = !skill.is_global;

                return (
                  <Badge
                    key={skill.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center py-3 px-4 text-sm transition-all hover:scale-105 min-h-[44px] touch-manipulation active:scale-95 ${
                      isSelected
                        ? isSuggested
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md"
                          : "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
                        : isSuggested
                        ? "hover:bg-blue-50 hover:border-blue-200 border-blue-300 bg-blue-50/50 text-blue-700"
                        : "hover:bg-red-50 hover:border-red-200 border-gray-300 bg-white"
                    }`}
                    onClick={() => handleSkillToggle(skill.id)}
                  >
                    {skill.name}
                    {isSuggested && (
                      <span className="ml-1 text-xs opacity-75">✨</span>
                    )}
                  </Badge>
                );
              })}
              {allSkills.length === 0 && !skillsLoading && (
                <div className="text-center text-gray-500 w-full py-8">
                  No skills available. Add your own below!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex-shrink-0">
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed mb-3">
          Can't find your skill? Suggest it here:
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Suggest a new skill"
            value={suggestedSkill}
            onChange={(e) => setSuggestedSkill(e.target.value)}
            onKeyDown={handleSuggestSkillWithEnter}
            className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSuggestSkill}
            disabled={!suggestedSkill.trim()}
            className="h-12 w-12 border-gray-300 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
