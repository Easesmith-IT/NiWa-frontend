"use client";

import React from "react";
import { Check, Megaphone, Smartphone, Users, FileCode, Calendar, Rocket } from "lucide-react";

export interface StepItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const WIZARD_STEPS: StepItem[] = [
  { id: 1, label: "Campaign Details", shortLabel: "Campaign", icon: Megaphone },
  { id: 2, label: "WhatsApp & Template", shortLabel: "WhatsApp", icon: Smartphone },
  { id: 3, label: "Audience", shortLabel: "Audience", icon: Users },
  { id: 4, label: "Variables & Content", shortLabel: "Variables", icon: FileCode },
  { id: 5, label: "Schedule", shortLabel: "Schedule", icon: Calendar },
  { id: 6, label: "Review & Launch", shortLabel: "Review", icon: Rocket },
];

interface CampaignWizardStepperProps {
  currentStep: number;
  maxReachedStep: number;
  onStepClick: (stepId: number) => void;
}

export const CampaignWizardStepper: React.FC<CampaignWizardStepperProps> = ({
  currentStep,
  maxReachedStep,
  onStepClick,
}) => {
  return (
    <div className="w-full border-b bg-white px-4 py-3 shadow-xs lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ol className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isClickable = step.id <= maxReachedStep;
            const Icon = step.icon;

            return (
              <li key={step.id} className="relative flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : isCompleted
                      ? "text-gray-900 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{step.shortLabel}</span>
                </button>

                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`mx-2 hidden h-0.5 flex-1 sm:block ${
                      step.id < currentStep ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
