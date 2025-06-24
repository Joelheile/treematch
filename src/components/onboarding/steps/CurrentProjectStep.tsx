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
          What's the coolest passion/project/thing you've done/have?
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
          This is your chance to showcase what makes you unique! Share
          something you're proud of - whether it's a current project, past
          achievement, hobby, or passion. Think of something that would
          spark an interesting conversation :)
        </p>
      </div>

      <div>
        <Label
          htmlFor="currentProject"
          className="text-base sm:text-lg font-semibold text-gray-700 mb-2 block"
        >
          Your Coolest Thing*
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
          placeholder="Tell us about something awesome you've done or are working on..."
          className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
        />
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            <strong>Examples:</strong> Built a viral TikTok channel,
            started a startup, part of Excel world championship, built a
            community event, etc.
          </p>
        </div>
      </div>
    </div>
  );
} 