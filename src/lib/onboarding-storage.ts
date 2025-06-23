export interface OnboardingData {
  name: string
  country: string
  university: string
  profileImage: string
  skills: string[]
  skillIds?: string[]
  summerGoals: string
  currentProject: string
  linkedinUrl: string
  instagramHandle: string
  twitterHandle: string
  githubUsername: string
  completedAt?: string
}

const STORAGE_KEY = 'treematch_onboarding_data'

export class OnboardingStorage {
  static save(data: OnboardingData): void {
    try {
      const dataWithTimestamp = {
        ...data,
        completedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp))
    } catch (error) {
      console.error('Failed to save onboarding data to localStorage:', error)
    }
  }

  static load(): OnboardingData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const data = JSON.parse(stored) as OnboardingData
      return data
    } catch (error) {
      console.error('Failed to load onboarding data from localStorage:', error)
      return null
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear onboarding data from localStorage:', error)
    }
  }

  static exists(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null
    } catch (error) {
      return false
    }
  }

  static isExpired(maxAgeHours: number = 24): boolean {
    try {
      const data = this.load()
      if (!data?.completedAt) return true
      
      const completedAt = new Date(data.completedAt)
      const now = new Date()
      const ageHours = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60)
      
      return ageHours > maxAgeHours
    } catch (error) {
      return true
    }
  }
}

export const useOnboardingStorage = () => {
  return {
    save: OnboardingStorage.save,
    load: OnboardingStorage.load,
    clear: OnboardingStorage.clear,
    exists: OnboardingStorage.exists,
    isExpired: OnboardingStorage.isExpired
  }
} 