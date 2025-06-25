import { OnboardingData } from '@/lib/onboarding-storage'
import { StudentInsert } from '@/types/Student'
import { createClient } from '../../integrations/supabase/client-ssr'
import { moveAvatarAfterLogin } from '../../integrations/supabase/moveAvatarAfterLogin'

export class OnboardingService {
  private extractUsername(platform: string, input: string): string | null {
    if (!input.trim()) return null

    // Remove any existing URL prefixes to get just the username
    let cleanInput = input.trim()
    
    switch (platform) {
      case "linkedin":
        cleanInput = cleanInput.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')
        break
      case "github":
        cleanInput = cleanInput.replace(/^https?:\/\/(www\.)?github\.com\//, '')
        break
      case "twitter":
        cleanInput = cleanInput.replace(/^https?:\/\/(www\.)?(twitter\.com\/|x\.com\/)/, '')
        break
      case "instagram":
        cleanInput = cleanInput.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        break
    }
    
    // Remove @ symbol and trailing slashes
    cleanInput = cleanInput.replace(/^@/, '').replace(/\/$/, '')
    
    return cleanInput || null
  }

  convertOnboardingDataToStudent(
    onboardingData: OnboardingData, 
    userEmail: string
  ): StudentInsert {
    return {
      name: onboardingData.name,
      email: userEmail,
      country: onboardingData.country,
      university: onboardingData.university,
      courses: onboardingData.courses,
      profile_image: onboardingData.profileImage || null,
      goals: onboardingData.summerGoals,
      current_project: onboardingData.currentProject,
      phone_number: onboardingData.phoneNumber || null,
      linkedin: this.extractUsername("linkedin", onboardingData.linkedinUrl),
      github: this.extractUsername("github", onboardingData.githubUsername),
      website: onboardingData.websiteUrl || null,
      instagram: this.extractUsername("instagram", onboardingData.instagramHandle),
      twitter: this.extractUsername("twitter", onboardingData.twitterHandle),
      isOnboarded: true,
    }
  }

  async createStudentSkills(studentId: string, skillIds: string[]) {
    if (skillIds.length === 0) return

    const studentSkills = skillIds.map(skillId => ({
      student_id: studentId,
      skill_id: skillId
    }))

    const supabase = createClient()
    const { error } = await supabase
      .from('student_skills')
      .insert(studentSkills)

    if (error) throw error
  }

  async updateStudentSkills(studentId: string, skillIds: string[]) {
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('student_skills')
      .delete()
      .eq('student_id', studentId)

    if (deleteError) throw deleteError

    await this.createStudentSkills(studentId, skillIds)
  }

  async getStudentByEmail(email: string) {
    console.log('getStudentByEmail called with:', email)
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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