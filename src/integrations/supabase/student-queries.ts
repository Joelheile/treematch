import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type SkillRow = Tables<'skills'>
type StudentRow = Tables<'students'>
type StudentWithSkills = StudentRow & { skills: SkillRow[] }

export const useSkills = (userId?: string) => {
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .or(`is_global.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
        .order('name')

      if (error) throw error
      return data as SkillRow[]
    },
  })
}

export const useStudentById = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (studentError) throw studentError

      const { data: skillsData, error: skillsError } = await supabase
        .from('student_skills')
        .select(`
          skills (
            id,
            name,
            is_global,
            user_id,
            created_at
          )
        `)
        .eq('student_id', id)

      if (skillsError) throw skillsError

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      
      return {
        ...studentData,
        skills
      } as StudentWithSkills
    },
    enabled: !!id,
  })
}

export const useStudents = (options: {
  limit?: number
  offset?: number
  skillIds?: string[]
  country?: string
  search?: string
} = {}) => {
  return useQuery({
    queryKey: ['students', options],
    queryFn: async () => {
      const { limit = 20, offset = 0, skillIds, country, search } = options

      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (country) {
        query = query.eq('country', country)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,current_project.ilike.%${search}%`)
      }

      const { data: studentsData, error: studentsError, count } = await query

      if (studentsError) throw studentsError

      let finalStudentsData = studentsData || []

      if (skillIds && skillIds.length > 0) {
        const { data: studentSkillsData, error: skillFilterError } = await supabase
          .from('student_skills')
          .select('student_id')
          .in('skill_id', skillIds)

        if (skillFilterError) throw skillFilterError

        const studentIdsWithSkills = studentSkillsData?.map(item => item.student_id) || []
        finalStudentsData = studentsData?.filter(student => 
          studentIdsWithSkills.includes(student.id)
        ) || []
      }

      const studentIds = finalStudentsData.map(student => student.id)
      
      if (studentIds.length === 0) {
        return {
          data: [],
          count: 0,
          hasMore: false
        }
      }

      const { data: allSkillsData, error: allSkillsError } = await supabase
        .from('student_skills')
        .select(`
          student_id,
          skills (
            id,
            name,
            is_global,
            user_id,
            created_at
          )
        `)
        .in('student_id', studentIds)

      if (allSkillsError) throw allSkillsError

      const skillsByStudent = allSkillsData?.reduce((acc, item) => {
        const studentId = item.student_id
        const skill = (item as any).skills
        if (!acc[studentId]) acc[studentId] = []
        if (skill) acc[studentId].push(skill)
        return acc
      }, {} as Record<string, SkillRow[]>) || {}

      const studentsWithSkills = finalStudentsData.map(student => ({
        ...student,
        skills: skillsByStudent[student.id] || []
      })) as StudentWithSkills[]

      return {
        data: studentsWithSkills,
        count: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    },
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      student, 
      skillIds 
    }: { 
      student: any
      skillIds: string[] 
    }) => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single()

      if (studentError) throw studentError

      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentData.id,
          skill_id: skillId
        }))

        const { error: skillsError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (skillsError) {
          await supabase.from('students').delete().eq('id', studentData.id)
          throw skillsError
        }
      }

      return studentData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useUpdateStudentSkills = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      skillIds 
    }: { 
      studentId: string
      skillIds: string[] 
    }) => {
      const { error: deleteError } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', studentId)

      if (deleteError) throw deleteError

      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentId,
          skill_id: skillId
        }))

        const { error: insertError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (insertError) throw insertError
      }

      return true
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useAddSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      name, 
      userId,
      isGlobal = false 
    }: { 
      name: string
      userId: string
      isGlobal?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('skills')
        .insert([{ name, is_global: isGlobal, user_id: isGlobal ? null : userId }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
} 