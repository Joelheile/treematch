"use client";

import { Progress } from "@/components/ui/progress";
import { Briefcase, Check, Target, User, Users } from "lucide-react";
import Image from "next/image";
import { Step } from "./types";

interface OnboardingSidebarProps {
  currentStep: number;
  steps: Step[];
  progressPercentage: number;
  isMobile?: boolean;
}

export default function OnboardingSidebar({
  currentStep,
  steps,
  progressPercentage,
  isMobile = false,
}: OnboardingSidebarProps) {
  const stepsWithIcons = steps.map((step) => {
    const icons = [Target, Target, Briefcase, Check, Users, User];
    return {
      ...step,
      icon: icons[step.number - 1],
      completed: currentStep > step.number,
    };
  });

  if (isMobile) {
    return (
      <div className="lg:hidden bg-white border-b border-gray-200 p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/icon.png"
              alt="TreeMatch"
              width={24}
              height={24}
              className="w-6 h-6 sm:w-7 sm:h-7"
            />
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              Treematch
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {currentStep} of {steps.length}
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={progressPercentage}
            className="h-2 [&>div]:bg-red-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span className="truncate pr-2">
              {steps[currentStep - 1]?.title}
            </span>
            <span className="flex-shrink-0">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex w-80 xl:w-96 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <div className="p-6 w-full">
        <div className="flex items-center space-x-3 mb-8">
          <Image
            src="/icon.png"
            alt="TreeMatch"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div className="text-2xl font-bold text-gray-900">Treematch</div>
        </div>

        <div className="space-y-1">
          {stepsWithIcons.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  step.number === currentStep
                    ? "bg-red-50 border border-red-200"
                    : step.completed
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    step.number === currentStep
                      ? "bg-red-600 text-white"
                      : step.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.completed ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {step.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
