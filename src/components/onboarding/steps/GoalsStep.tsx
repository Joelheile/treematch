"use client";

import { Textarea } from "@/components/ui/textarea";
import { FormData } from "../types";

interface GoalsStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export default function GoalsStep({
  formData,
  setFormData,
}: GoalsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
          What do you hope to achieve this semester?*
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
          Tell others about what you want to achieve? Build something,
          meet VCs, get inspired, learn a new skill, etc.
        </p>
      </div>

      <div>
        <Textarea
          id="goals"
          value={formData.summerGoals}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              summerGoals: e.target.value,
            }))
          }
          placeholder="e.g., Launch my startup, complete my CS thesis, find an internship, build my network, learn new skills..."
          className="min-h-[120px] sm:min-h-[140px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-base resize-none"
        />
      </div>
    </div>
  );
} 