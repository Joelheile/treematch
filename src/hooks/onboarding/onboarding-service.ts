import { OnboardingData } from '@/lib/onboarding-storage'
import { supabase } from '../../integrations/supabase/client'
import { TablesInsert } from '../../integrations/supabase/types'

type StudentInsert = TablesInsert<'students'>

export class OnboardingService {
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
      summer_goals: [onboardingData.summerGoals],
      current_project: onboardingData.currentProject,
      phone_number: null,
      linkedin: this.formatSocialUrl("linkedin", onboardingData.linkedinUrl),
      github: this.formatSocialUrl("github", onboardingData.githubUsername),
      website: this.formatSocialUrl("twitter", onboardingData.twitterHandle),
      isOnboarded: true,
    }
  }

  async getStudentByEmail(email: string) {
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single()

    if (studentError) {
      if (studentError.code === 'PGRST116') {
        return { data: null, error: null }
      }
      throw studentError
    }

    return { data: studentData, error: null }
  }

  async createStudent(student: StudentInsert) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  }

  async updateStudent(id: string, updates: Partial<StudentInsert>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  }

  async saveOnboardingDataToDatabase(
    onboardingData: OnboardingData,
    userEmail: string
  ) {
    try {
      const existingStudentResponse = await this.getStudentByEmail(userEmail)
      
      const studentData = this.convertOnboardingDataToStudent(onboardingData, userEmail)

      if (existingStudentResponse.data) {
        const updateData = {
          ...studentData,
          id: undefined,
        }
        const result = await this.updateStudent(
          existingStudentResponse.data.id,
          updateData
        )
        return result
      } else {
        const result = await this.createStudent(studentData)
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