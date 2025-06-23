import { OnboardingData } from '@/lib/onboarding-storage'
import { createClient } from './client-ssr'
import { StudentInsert, StudentService } from './student-service'

export class OnboardingService {
  private studentService: StudentService

  constructor() {
    this.studentService = new StudentService(createClient())
  }

  private formatSocialUrl(platform: string, input: string): string | null {
    if (!input.trim()) return null

    switch (platform) {
      case "linkedin":
        return input.startsWith("http")
          ? input
          : `https://www.linkedin.com/in/${input.replace("@", "")}`
      case "github":
        return input.startsWith("http")
          ? input
          : `https://github.com/${input.replace("@", "")}`
      case "twitter":
        return input.startsWith("http")
          ? input
          : `https://twitter.com/${input.replace("@", "")}`
      case "instagram":
        return input.startsWith("http")
          ? input
          : `https://instagram.com/${input.replace("@", "")}`
      default:
        return input
    }
  }

  convertOnboardingDataToStudent(
    onboardingData: OnboardingData, 
    userEmail: string
  ): StudentInsert {
    return {
      name: onboardingData.name,
      email: userEmail,
      country: onboardingData.country,
      profile_image: onboardingData.profileImage || null,
      skills: onboardingData.skills,
      summer_goals: [onboardingData.summerGoals],
      current_project: onboardingData.currentProject,
      phone_number: null,
      linkedin: this.formatSocialUrl("linkedin", onboardingData.linkedinUrl),
      github: this.formatSocialUrl("github", onboardingData.githubUsername),
      website: this.formatSocialUrl("twitter", onboardingData.twitterHandle), // Using website field for Twitter
      isOnboarded: true,
    }
  }

  async saveOnboardingDataToDatabase(
    onboardingData: OnboardingData,
    userEmail: string
  ) {
    try {
      // Check if student already exists
      const existingStudentResponse = await this.studentService.getStudentByEmail(userEmail)
      
      const studentData = this.convertOnboardingDataToStudent(onboardingData, userEmail)

      if (existingStudentResponse.data) {
        // Update existing student
        const updateData = {
          ...studentData,
          id: undefined, // Remove id from update data
        }
        const result = await this.studentService.updateStudent(
          existingStudentResponse.data.id,
          updateData
        )
        return result
      } else {
        // Create new student
        const result = await this.studentService.createStudent(studentData)
        return result
      }
    } catch (error) {
      console.error('Error saving onboarding data to database:', error)
      return {
        data: null,
        error: `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

export const onboardingService = new OnboardingService() 