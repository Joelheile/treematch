import { OnboardingData } from '@/lib/onboarding-storage'
import { StudentInsert } from '@/types/Student'
import { supabase } from '../../integrations/supabase/client'
import { createClient } from '../../integrations/supabase/client-ssr'
import { moveAvatarAfterLogin } from '../../integrations/supabase/moveAvatarAfterLogin'

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
      goals: onboardingData.summerGoals,
      current_project: onboardingData.currentProject,
      phone_number: null,
      linkedin: this.formatSocialUrl("linkedin", onboardingData.linkedinUrl),
      github: this.formatSocialUrl("github", onboardingData.githubUsername),
      website: this.formatSocialUrl("twitter", onboardingData.twitterHandle),
      instagram: this.formatSocialUrl("instagram", onboardingData.instagramHandle),
      isOnboarded: true,
    }
  }

  async createStudentSkills(studentId: string, skillIds: string[]) {
    if (skillIds.length === 0) return

    const studentSkills = skillIds.map(skillId => ({
      student_id: studentId,
      skill_id: skillId
    }))

    const { error } = await supabase
      .from('student_skills')
      .insert(studentSkills)

    if (error) throw error
  }

  async updateStudentSkills(studentId: string, skillIds: string[]) {
    const { error: deleteError } = await supabase
      .from('student_skills')
      .delete()
      .eq('student_id', studentId)

    if (deleteError) throw deleteError

    await this.createStudentSkills(studentId, skillIds)
  }

  async getStudentByEmail(email: string) {
    console.log('getStudentByEmail called with:', email)
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single()

    console.log('getStudentByEmail result:', { studentData, studentError })
    if (studentError) {
      if (studentError.code === 'PGRST116') {
        return { data: null, error: null }
      }
      throw studentError
    }

    return { data: studentData, error: null }
  }

  async createStudent(student: StudentInsert, skillIds: string[] = []) {
    console.log('createStudent called with:', { student, skillIds })
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single()

    console.log('createStudent result:', { data, error })
    if (error) throw error

    if (skillIds.length > 0) {
      await this.createStudentSkills(data.id, skillIds)
    }

    return { data, error: null }
  }

  async updateStudent(id: string, updates: Partial<StudentInsert>, skillIds?: string[]) {
    console.log('updateStudent called with:', { id, updates, skillIds })
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('updateStudent error:', { updates, error })
    }
    console.log('updateStudent result:', { data, error })
    if (error) throw error

    if (skillIds !== undefined) {
      await this.updateStudentSkills(id, skillIds)
    }

    return { data, error: null }
  }

  async saveOnboardingDataToDatabase(
    onboardingData: OnboardingData,
    userEmail: string
  ) {
    try {
      let profileImage = onboardingData.profileImage || null
      console.log('saveOnboardingDataToDatabase called with:', { onboardingData, userEmail })
      
      if (onboardingData.tempAvatarPath && onboardingData.tempAvatarPath !== "") {
        try {
          const supabaseAuth = createClient()
          const user = await supabaseAuth.auth.getUser()
          console.log('User from supabaseAuth.auth.getUser:', user)
          if (user.data?.user?.id) {
            const movedAvatarUrl = await moveAvatarAfterLogin(onboardingData.tempAvatarPath, user.data.user.id)
            console.log('movedAvatarUrl:', movedAvatarUrl)
            if (movedAvatarUrl) {
              profileImage = movedAvatarUrl
            }
          }
        } catch (avatarError) {
          console.warn('Avatar moving failed, using existing image:', avatarError)
        }
      }
      
      const existingStudentResponse = await this.getStudentByEmail(userEmail)
      console.log('existingStudentResponse:', existingStudentResponse)
      
      const studentData = this.convertOnboardingDataToStudent({ ...onboardingData, profileImage }, userEmail)
      const skillIds = onboardingData.skillIds
      
      console.log('studentData for insert/update:', studentData)
      console.log('skillIds:', skillIds)
      
      if (existingStudentResponse.data) {
        const { id } = existingStudentResponse.data
        const { id: _, ...updateData } = studentData
        console.log('Calling updateStudent with:', { id, updateData, skillIds })
        const result = await this.updateStudent(id, updateData, skillIds)
        console.log('updateStudent result:', result)
        return result
      } else {
        console.log('Calling createStudent with:', { studentData, skillIds })
        const result = await this.createStudent(studentData, skillIds)
        console.log('createStudent result:', result)
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