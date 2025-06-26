"use client"

import { Textarea } from "@/components/ui/textarea"
import type { FormData } from "../types"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CurrentProjectStepProps {
  formData: FormData
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void
}

export default function CurrentProjectStep({ formData, setFormData }: CurrentProjectStepProps) {
  const [focusState, setFocusState] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [descriptionIndex, setDescriptionIndex] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const descriptions = [
    "Build something amazing",
    "Master a new skill",
    "Pursue a passion project",
    "Solve an interesting problem",
    "Create something meaningful"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setDescriptionIndex((prev) => (prev + 1) % descriptions.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [descriptions.length])

  return (
    <div className={`max-w-2xl mx-auto space-y-7 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <h2 className="text-3xl font-semibold text-gray-900">
        What's your thing?
      </h2>

      {/* Input Area */}
      <motion.div
        className={`relative border-none${focusState ? 'shadow-md' : 'shadow-sm'}`}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-lg p-1">
          <Textarea
            id="currentProject"
            value={formData.currentProject}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                currentProject: e.target.value,
              }))
            }
            onFocus={() => setFocusState(true)}
            onBlur={() => setFocusState(false)}
            placeholder="Share what you're passionate about..."
            className="min-h-[160px] text-base border border-gray-200 bg-white rounded-lg p-4 resize-none focus:ring-1 focus:ring-stanford-cardinal focus:border-stanford-cardinal transition-all duration-200 w-full"
          />
        </div>
        
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-xs text-gray-500 flex items-center">
            <Sparkles className="h-3 w-3 mr-1.5 text-stanford-cardinal" />
            <span>Find others with similar interests</span>
          </div>
          <div className={`text-xs ${formData.currentProject.length > 400 ? 'text-stanford-cardinal' : 'text-gray-500'}`}>
            {formData.currentProject.length}/500
          </div>
        </div>
      </motion.div>

      {/* Sliding descriptions below textbox */}
      <div className="flex flex-col items-center">
        <div className="relative h-6 overflow-hidden w-full max-w-sm">
          {/* Gradient overlays for fade effect */}
          <div className="absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={descriptionIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="text-gray-600 w-full text-center absolute left-0 right-0 font-medium"
            >
              {descriptions[descriptionIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-1">
          {descriptions.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === descriptionIndex ? 'bg-stanford-cardinal' : 'bg-gray-200'
              }`}
              animate={{
                width: index === descriptionIndex ? '16px' : '6px',
                opacity: index === descriptionIndex ? 1 : 0.5
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
