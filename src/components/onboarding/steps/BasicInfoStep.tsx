"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { Country, FormData } from "../types";
import { countryToFlag } from "../utils";
import { Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { validatePhoneNumber } from "@/lib/phone-validation";

interface BasicInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  countryInput: string;
  showCountrySuggestions: boolean;
  selectedCountry: Country | null;
  countrySuggestions: Country[];
  name: string;
  user: any;
  student: any;
  handleCountryInputChange: (value: string) => void;
  handleCountrySelect: (country: Country) => void;
  handleNameChange: (value: string) => void;
  setShowCountrySuggestions: (show: boolean) => void;
}

export default function BasicInfoStep({
  formData,
  setFormData,
  countryInput,
  showCountrySuggestions,
  selectedCountry,
  countrySuggestions,
  name,
  user,
  student,
  handleCountryInputChange,
  handleCountrySelect,
  handleNameChange,
  setShowCountrySuggestions,
}: BasicInfoStepProps) {
  const isMobile = useIsMobile();
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const privacyContent = "Your phone number will only be shown to people you've mutually liked.";
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current && 
        !countryDropdownRef.current.contains(event.target as Node) &&
        countryInputRef.current && 
        !countryInputRef.current.contains(event.target as Node)
      ) {
        setShowCountrySuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowCountrySuggestions]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Image
            src="/logo.png"
            alt="TreeMatch"
            width={64}
            height={64}
            className="w-12 h-12 sm:w-16 sm:h-16"
          />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          {user && student ? "Update Your Profile" : "Welcome to Treematch!"}
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
        <div>
          <Label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Full Name*
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your full name"
            className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
          />
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
          <div className="flex items-center gap-1.5 mb-1">
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 block"
            >
              Phone Number*
            </Label>
            
            {isMobile ? (
              <div className="relative">
                <button 
                  type="button" 
                  className="inline-flex items-center justify-center w-6 h-6 -mr-1 touch-manipulation"
                  aria-label="Phone number privacy information"
                  onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                >
                  <Info size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
                {showMobileTooltip && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    {privacyContent}
                    <button 
                      className="block mt-2 text-xs text-gray-300 underline"
                      onClick={() => setShowMobileTooltip(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
                {showMobileTooltip && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMobileTooltip(false)}
                  />
                )}
              </div>
            ) : (
              <button 
                type="button" 
                className="inline-flex items-center justify-center w-5 h-5"
                aria-label="Phone number privacy information"
                title={privacyContent}
              >
                <Info size={14} className="text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>
          
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                phoneNumber: e.target.value,
              }));
            }}
            placeholder="e.g. +54 9 11 6661 1731"
            className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base w-full"
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
                ref={countryInputRef}
                value={countryInput}
                onChange={(e) => {
                  handleCountryInputChange(e.target.value);
                  if (e.target.value.length > 0) {
                    setShowCountrySuggestions(true);
                  } else {
                    setShowCountrySuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (countryInput.length > 0) {
                    setShowCountrySuggestions(true);
                  }
                }}
                placeholder="Start typing your country..."
                className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 text-base"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && showCountrySuggestions && countrySuggestions.length > 0) {
                    e.preventDefault();
                    handleCountrySelect(countrySuggestions[0]);
                    setShowCountrySuggestions(false);
                  }
                }}
              />

              {showCountrySuggestions && countrySuggestions.length > 0 && (
                <div 
                  ref={countryDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto"
                >
                  {countrySuggestions.map((country) => (
                    <div
                      key={country.code}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                      onClick={() => {
                        handleCountrySelect(country);
                        setShowCountrySuggestions(false);
                      }}
                    >
                      <span className="text-base sm:text-lg">
                        {countryToFlag(country.code)}
                      </span>
                      <span className="text-gray-900">{country.name}</span>
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
