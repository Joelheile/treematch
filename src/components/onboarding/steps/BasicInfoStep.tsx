"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { TreePine } from "lucide-react";
import { FormData, Country } from "../types";
import { countryToFlag } from "../utils";

interface BasicInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  countryInput: string;
  showCountrySuggestions: boolean;
  selectedCountry: Country | null;
  countrySuggestions: Country[];
  firstName: string;
  lastName: string;
  user: any;
  student: any;
  handleCountryInputChange: (value: string) => void;
  handleCountrySelect: (country: Country) => void;
  handleNameChange: (field: "first" | "last", value: string) => void;
  setShowCountrySuggestions: (show: boolean) => void;
}

export default function BasicInfoStep({
  formData,
  setFormData,
  countryInput,
  showCountrySuggestions,
  selectedCountry,
  countrySuggestions,
  firstName,
  lastName,
  user,
  student,
  handleCountryInputChange,
  handleCountrySelect,
  handleNameChange,
  setShowCountrySuggestions,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          {user && student
            ? "Update Your Profile"
            : "Welcome to Treematch!"}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4 px-2">
          {user && student
            ? "Review and update your profile information."
            : "Connect with fellow students for projects, collaboration, and friendship."}
        </p>
        <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm px-2">
          {user && student
            ? "Make sure your information is up to date."
            : "Let's start with some basic information to build your profile."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              First Name*
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => handleNameChange("first", e.target.value)}
              placeholder="First Name"
              className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
            />
          </div>
          <div>
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Last Name*
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => handleNameChange("last", e.target.value)}
              placeholder="Last Name"
              className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="university"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Home University*
          </Label>
          <Input
            id="university"
            value={formData.university}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                university: e.target.value,
              }))
            }
            placeholder="Oxford, Technical University Munich, etc."
            className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
          />
        </div>

        <div>
          <Label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Phone Number*
          </Label>
          <PhoneInput
            value={formData.phoneNumber}
            onChange={(phone) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber: phone,
              }))
            }
            inputClassName="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base w-full"
            className="w-full"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="relative">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Country*
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                id="country"
                value={countryInput}
                onChange={(e) => handleCountryInputChange(e.target.value)}
                onFocus={() =>
                  setShowCountrySuggestions(countryInput.length > 0)
                }
                onBlur={() =>
                  setTimeout(() => setShowCountrySuggestions(false), 200)
                }
                placeholder="Start typing your country..."
                className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                autoComplete="off"
              />

              {showCountrySuggestions &&
                countrySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto">
                    {countrySuggestions.map((country) => (
                      <div
                        key={country.code}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <span className="text-base sm:text-lg">
                          {countryToFlag(country.code)}
                        </span>
                        <span className="text-gray-900">
                          {country.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {selectedCountry && (
              <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-xl sm:text-2xl">
                  {countryToFlag(selectedCountry.code)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 