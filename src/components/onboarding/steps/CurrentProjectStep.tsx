"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "../types";

interface CurrentProjectStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export default function CurrentProjectStep({
  formData,
  setFormData,
}: CurrentProjectStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
          What's something awesome you're working on?
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
          Share something you're excited about! This could be a side project, 
          research, startup idea, hobby, or anything that showcases your interests. 
          Help others understand what gets you fired up.
        </p>
      </div>

      <div>
        <Label
          htmlFor="currentProject"
          className="text-base sm:text-lg font-semibold text-gray-700 mb-2 block"
        >
          Current Project or Interest*
        </Label>
        <Textarea
          id="currentProject"
          value={formData.currentProject}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              currentProject: e.target.value,
            }))
          }
          placeholder="What are you working on or passionate about right now..."
          className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
        />
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            <strong>Examples:</strong> Building an AI study app, researching sustainable energy, 
            starting a campus club, learning to surf, training for a marathon, creating art, etc.
          </p>
        </div>
      </div>
    </div>
  );
} 