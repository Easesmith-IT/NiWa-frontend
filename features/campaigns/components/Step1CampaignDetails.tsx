"use client";

import React from "react";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface Step1Props {
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  onNext: () => void;
}

export const Step1CampaignDetails: React.FC<Step1Props> = ({
  name,
  setName,
  description,
  setDescription,
  onNext,
}) => {
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Megaphone className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 1: Campaign Details</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Give your messaging campaign a clear name and optional description for tracking and analytics.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Summer Festival Promotion 2026"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            maxLength={100}
            className="w-full"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description (Optional)</label>
          <Input
            placeholder="Brief notes about target audience or offer details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={250}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="md" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue to WhatsApp & Template
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
