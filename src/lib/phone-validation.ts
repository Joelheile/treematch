import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: 'Phone number is required' }
  }

  try {
    const parsedNumber = parsePhoneNumber(phoneNumber)
    
    if (!parsedNumber) {
      return { isValid: false, error: 'Invalid phone number format' }
    }

    if (!parsedNumber.isValid()) {
      return { isValid: false, error: 'Phone number is not valid for the selected country' }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid phone number format' }
  }
}

export const isValidPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false
  }

  try {
    return isValidPhoneNumber(phoneNumber)
  } catch (error) {
    return false
  }
} 