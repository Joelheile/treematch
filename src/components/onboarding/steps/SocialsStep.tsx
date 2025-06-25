"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { FormData } from "../types";

interface SocialsStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export default function SocialsStep({
  formData,
  setFormData,
}: SocialsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          Connect with You
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
          Share your social media profiles so others can connect with you
          outside of TreeMatch. <strong>Just enter your username</strong> (without @ symbol) - we'll create the proper links automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor="linkedinUrl"
            className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            LinkedIn
            <span className="text-xs text-gray-500 font-normal ml-1">(username only)</span>
          </Label>
          <Input
            id="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                linkedinUrl: e.target.value,
              }))
            }
            placeholder="yourusername"
            className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <Label
            htmlFor="instagramHandle"
            className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            Instagram
            <span className="text-xs text-gray-500 font-normal ml-1">(username only)</span>
          </Label>
          <Input
            id="instagramHandle"
            value={formData.instagramHandle}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                instagramHandle: e.target.value,
              }))
            }
            placeholder="username"
            className="h-11 sm:h-12 border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-base"
          />
        </div>

        <div>
          <Label
            htmlFor="twitterHandle"
            className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
          >
            <Twitter className="w-4 h-4 text-blue-400" />
            Twitter / X
            <span className="text-xs text-gray-500 font-normal ml-1">(username only)</span>
          </Label>
          <Input
            id="twitterHandle"
            value={formData.twitterHandle}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                twitterHandle: e.target.value,
              }))
            }
            placeholder="username"
            className="h-11 sm:h-12 border-gray-300 focus:border-blue-400 focus:ring-blue-400 text-base"
          />
        </div>

        <div>
          <Label
            htmlFor="githubUsername"
            className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
          >
            <Github className="w-4 h-4 text-gray-800" />
            GitHub
            <span className="text-xs text-gray-500 font-normal ml-1">(username only)</span>
          </Label>
          <Input
            id="githubUsername"
            value={formData.githubUsername}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                githubUsername: e.target.value,
              }))
            }
            placeholder="username"
            className="h-11 sm:h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-base"
          />
        </div>

        <div>
          <Label
            htmlFor="websiteUrl"
            className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
            Website
            <span className="text-xs text-gray-500 font-normal ml-1">(full URL)</span>
          </Label>
          <Input
            id="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                websiteUrl: e.target.value,
              }))
            }
            placeholder="https://yourwebsite.com"
            className="h-11 sm:h-12 border-gray-300 focus:border-gray-600 focus:ring-gray-600 text-base"
          />
        </div>
      </div>
    </div>
  );
} 