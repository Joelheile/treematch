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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 leading-tight">
          Share something you're excited about
        </h2>
      </div>

      <div>
        <Textarea
          id="currentProject"
          value={formData.currentProject}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              currentProject: e.target.value,
            }))
          }
          placeholder="e.g., Building an AI study app, researching sustainable energy, starting a campus club, learning to surf, training for a marathon..."
          className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
        />
      </div>
    </div>
  );
} 