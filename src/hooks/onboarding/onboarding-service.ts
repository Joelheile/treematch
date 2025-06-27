import { TablesInsert } from '@/integrations/supabase/types'
import { OnboardingData } from '@/lib/onboarding-storage'
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
  ): TablesInsert<'students'> {
    return {
      name: onboardingData.name,
      email: userEmail,
      country: onboardingData.country,
      university: onboardingData.university,
      courses: onboardingData.courses,
      profile_image: onboardingData.profileImage || null,
      goals: onboardingData.summerGoals,
      coolest_thing: onboardingData.coolestThing,
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
      .upsert(studentSkills, { 
        onConflict: 'student_id,skill_id',
        ignoreDuplicates: true 
      })

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
    const supabase = createClient()
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



  async createStudent(student: TablesInsert<'students'>, skillIds: string[] = []) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single()
    if (error) throw error

    if (skillIds.length > 0) {
      await this.createStudentSkills(data.id, skillIds)
    }

    return { data, error: null }
  }

  async updateStudent(id: string, updates: Partial<TablesInsert<'students'>>, skillIds?: string[]) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
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
      
      if (onboardingData.tempAvatarPath && onboardingData.tempAvatarPath !== "") {
        try {
          const supabaseAuth = createClient()
          const user = await supabaseAuth.auth.getUser()
          if (user.data?.user?.id) {
            const movedAvatarUrl = await moveAvatarAfterLogin(onboardingData.tempAvatarPath, user.data.user.id)
            if (movedAvatarUrl) {
              profileImage = movedAvatarUrl
            }
          }
        } catch (avatarError) {
          console.error('Avatar moving failed:', avatarError)
        }
      }
      
      const existingStudentResponse = await this.getStudentByEmail(userEmail)
      const studentData = this.convertOnboardingDataToStudent({ ...onboardingData, profileImage }, userEmail)
      const skillIds = onboardingData.skillIds || []
      
      if (existingStudentResponse.data) {
        // Update existing student
        const { id } = existingStudentResponse.data
        const { id: _, ...updateData } = studentData
        const result = await this.updateStudent(id, updateData, skillIds)
        return result
      } else {
        // Create new student
        const result = await this.createStudent(studentData, skillIds)
        return result
      }
    } catch (error) {
      console.error('saveOnboardingDataToDatabase error:', error)
      return {
        data: null,
        error: `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

export const onboardingService = new OnboardingService() 