import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'

export type StudentRow = Tables<'students'>
export type StudentInsert = TablesInsert<'students'>
export type StudentUpdate = TablesUpdate<'students'>
export type SkillRow = Tables<'skills'>
export type StudentSkillRow = Tables<'student_skills'>
export type StudentSkillInsert = TablesInsert<'student_skills'>

export interface StudentWithSkills extends StudentRow {
  skills: SkillRow[]
}

export const formatStudentFromDB = (dbStudent: StudentRow, skills: SkillRow[] = []): StudentWithSkills => {
  return {
    ...dbStudent,
    skills: skills
  }
}

export const formatStudentForDB = (student: Partial<StudentRow>): StudentInsert => {
  return {
    name: student.name || null,
    country: student.country || null,
    university: student.university || null,
    profile_image: student.profile_image || null,
    courses: student.courses || null,
    current_project: student.current_project || null,
    coolest_thing: student.coolest_thing || null,
    goals: student.goals || null,
    phone_number: student.phone_number || null,
    email: student.email || null,
    linkedin: student.linkedin || null,
    github: student.github || null,
    instagram: student.instagram || null,
    website: student.website || null,
    isOnboarded: student.isOnboarded || false
  }
}

export const isValidStudent = (obj: any): obj is StudentRow => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    (obj.email === null || typeof obj.email === 'string')
  )
}

export const isValidStudentWithSkills = (obj: any): obj is StudentWithSkills => {
  return (
    isValidStudent(obj) &&
    'skills' in obj &&
    Array.isArray(obj.skills)
  )
}

export const createEmptyStudent = (): StudentInsert => ({
  name: null,
  country: null,
  university: null,
  profile_image: null,
  courses: [],
  current_project: null,
  coolest_thing: null,
  goals: null,
  phone_number: null,
  email: null,
  linkedin: null,
  github: null,
  instagram: null,
  website: null,
  isOnboarded: false
})

export const createStudentWithDefaults = (
  required: { name: string; email: string }
): StudentInsert => ({
  ...createEmptyStudent(),
  name: required.name,
  email: required.email
}) 