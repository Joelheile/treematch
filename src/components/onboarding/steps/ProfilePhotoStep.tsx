"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { FormData } from "../types";

interface ProfilePhotoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isUploadingImage: boolean;
  user: any;
  student: any;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfilePhotoStep({
  formData,
  setFormData,
  isUploadingImage,
  user,
  student,
  handleImageUpload,
}: ProfilePhotoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          Add Your Profile Photo*
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2 leading-relaxed">
          Upload a ✨friendly ✨ photo so others can recognize you around
          campus. We have over 500 students and there's no way to match
          anybody without a photo haha.
        </p>

        {formData.profileImage ? (
          <div className="relative inline-block">
            <img
              src={formData.profileImage}
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-red-100 mx-auto"
            />
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, profileImage: "" }))
                }
                className="h-11 text-sm sm:text-base"
              >
                Remove Photo
              </Button>
              <Label
                htmlFor="image-upload-change"
                className="cursor-pointer"
              >
                <Button
                  variant="outline"
                  asChild
                  className="h-11 text-sm sm:text-base"
                  disabled={isUploadingImage}
                >
                  <span>
                    {isUploadingImage ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-change"
                disabled={isUploadingImage}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploadingImage}
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                asChild
                disabled={isUploadingImage}
              >
                <span>
                  {isUploadingImage ? "Uploading..." : "Upload Photo"}
                </span>
              </Button>
            </Label>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              JPG, PNG or GIF • Max 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 