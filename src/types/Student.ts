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
  current_project: string | null
  coolest_thing: string | null
  skills: string[] | null
  courses: string[] | null
  goals: string | null
  phone_number: string | null
  email: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  created_at: string | null
  updated_at: string | null
  is_first_mover_batch: boolean | null
}

export interface StudentWithSkills extends Omit<Student, 'skills'> {
  skills: SkillRow[]
  is_first_mover_batch: boolean | null
}

export interface Skill {
  id: string
  name: string
  is_global: boolean
  user_id: string | null
  created_at: string | null
}

export const formatStudentFromDB = (dbStudent: StudentRow, skills: SkillRow[] = []): StudentWithSkills => {
  return {
    ...dbStudent,
    skills: skills,
    is_first_mover_batch: dbStudent.is_first_mover_batch
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
    website: student.website || null,
    is_first_mover_batch: student.is_first_mover_batch || false
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
  website: null,
  is_first_mover_batch: false
})

export const createStudentWithDefaults = (
  required: { name: string; email: string }
): StudentInsert => ({
  ...createEmptyStudent(),
  name: required.name,
  email: required.email,
  is_first_mover_batch: false
})
