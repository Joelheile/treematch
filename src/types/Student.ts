import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'

export type StudentRow = Tables<'students'>
export type StudentInsert = TablesInsert<'students'>
export type StudentUpdate = TablesUpdate<'students'>
export type SkillRow = Tables<'skills'>
export type StudentSkillRow = Tables<'student_skills'>
export type StudentSkillInsert = TablesInsert<'student_skills'>

export interface Student {
  id: string
  name: string | null
  country: string | null
  university: string | null
  profile_image: string | null
  summer_goals: string[] | null
  current_project: string | null
  coolest_thing: string | null
  phone_number: string | null
  email: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  created_at: string | null
  updated_at: string | null
}

export interface StudentWithSkills extends Student {
  skills: SkillRow[]
}

export interface Skill {
  id: string
  name: string
  is_global: boolean
  user_id: string | null
  created_at: string | null
}

export interface StudentFormatted {
  id: string
  name: string
  country: string
  university: string
  profileImage?: string
  skills: Skill[]
  summerGoals: string[]
  currentProject: string
  coolestThing: string
  phoneNumber: string
  email: string
  linkedin?: string
  github?: string
  isOnboarded: boolean
  website?: string
  createdAt: Date
  updatedAt: Date
}

export const formatStudentFromDB = (dbStudent: StudentRow, skills: SkillRow[] = []): StudentFormatted => {
  return {
    id: dbStudent.id,
    name: dbStudent.name || '',
    country: dbStudent.country || '',
    university: dbStudent.university || '',
    profileImage: dbStudent.profile_image || undefined,
    skills: skills,
    summerGoals: dbStudent.summer_goals || [],
    currentProject: dbStudent.current_project || '',
    coolestThing: dbStudent.coolest_thing || '',
    phoneNumber: dbStudent.phone_number || '',
    email: dbStudent.email || '',
    linkedin: dbStudent.linkedin || undefined,
    github: dbStudent.github || undefined,
    isOnboarded: dbStudent.isOnboarded || false,
    website: dbStudent.website || undefined,
    createdAt: new Date(dbStudent.created_at || ''),
    updatedAt: new Date(dbStudent.updated_at || '')
  }
}

export const formatStudentForDB = (student: Partial<StudentFormatted>): StudentInsert => {
  return {
    name: student.name || null,
    country: student.country || null,
    university: student.university || null,
    profile_image: student.profileImage || null,
    summer_goals: student.summerGoals || null,
    current_project: student.currentProject || null,
    coolest_thing: student.coolestThing || null,
    phone_number: student.phoneNumber || null,
    email: student.email || null,
    linkedin: student.linkedin || null,
    github: student.github || null,
    isOnboarded: student.isOnboarded || false,
    website: student.website || null
  }
}

export const isValidStudent = (obj: any): obj is Student => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    (obj.email === null || typeof obj.email === 'string')
  )
}

export const isValidStudentFormatted = (obj: any): obj is StudentFormatted => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    Array.isArray(obj.skills) &&
    Array.isArray(obj.summerGoals)
  )
}

export const createEmptyStudent = (): StudentInsert => ({
  name: null,
  country: null,
  profile_image: null,
  summer_goals: [],
  current_project: null,
  coolest_thing: null,
  phone_number: null,
  email: null,
  linkedin: null,
  github: null,
  website: null
})

export const createStudentWithDefaults = (
  required: { name: string; email: string }
): StudentInsert => ({
  ...createEmptyStudent(),
  name: required.name,
  email: required.email,
  summer_goals: []
})
