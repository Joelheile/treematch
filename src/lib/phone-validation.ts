export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: 'Phone number is required' }
  }

  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '')
  
  if (!cleaned.startsWith('+')) {
    return { isValid: false, error: 'Phone number must start with country code (e.g. +54...)' }
  }
  
  const digits = cleaned.slice(1)
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: 'Phone number should contain only digits after country code' }
  }
  
  if (digits.length < 7 || digits.length > 15) {
    return { isValid: false, error: 'Phone number should be 7-15 digits long' }
  }

  return { isValid: true }
}

export const isValidPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false
  }

  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '')
  
  if (!cleaned.startsWith('+')) {
    return false
  }
  
  const digits = cleaned.slice(1)
  return /^\d+$/.test(digits) && digits.length >= 7 && digits.length <= 15
} 