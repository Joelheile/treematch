import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Basic format validation - more lenient approach
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[().-]/g, '')
  
  // Check if it starts with + and has reasonable length
  if (!cleanNumber.startsWith('+') || cleanNumber.length < 8 || cleanNumber.length > 18) {
    return { isValid: false, error: 'Phone number should start with + and be 8-18 digits' }
  }
  
  // Check if it contains only valid characters after cleaning
  const digitsOnly = cleanNumber.slice(1) // Remove the +
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: 'Phone number should contain only digits after country code' }
  }

  return { isValid: true }
}

export const isValidPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false
  }

  // More lenient validation for step validation
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[().-]/g, '')
  
  // Just check basic format: starts with +, reasonable length, contains digits
  if (!cleanNumber.startsWith('+')) {
    return false
  }
  
  const digitsOnly = cleanNumber.slice(1)
  return /^\d+$/.test(digitsOnly) && digitsOnly.length >= 7 && digitsOnly.length <= 17
} 