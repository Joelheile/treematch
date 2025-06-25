export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string | null
          email: string
          country: string | null
          profile_image: string | null
          summer_goals: string[] | null
          current_project: string | null
          coolest_thing: string | null
          phone_number: string | null
          linkedin: string | null
          github: string | null
          website: string | null
          isOnboarded: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          country?: string | null
          profile_image?: string | null
          summer_goals?: string[] | null
          current_project?: string | null
          coolest_thing?: string | null
          phone_number?: string | null
          linkedin?: string | null
          github?: string | null
          website?: string | null
          isOnboarded?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          country?: string | null
          profile_image?: string | null
          summer_goals?: string[] | null
          current_project?: string | null
          coolest_thing?: string | null
          phone_number?: string | null
          linkedin?: string | null
          github?: string | null
          website?: string | null
          isOnboarded?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          is_global: boolean
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          is_global?: boolean
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          is_global?: boolean
          user_id?: string | null
          created_at?: string | null
        }
      }
      student_skills: {
        Row: {
          id: string
          student_id: string
          skill_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          skill_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          skill_id?: string
          created_at?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          code: string | null
          department: string | null
          is_global: boolean
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          department?: string | null
          is_global?: boolean
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          department?: string | null
          is_global?: boolean
          user_id?: string | null
          created_at?: string | null
        }
      }
      student_courses: {
        Row: {
          id: string
          student_id: string
          course_id: string
          status: string
          grade: string | null
          quarter: string | null
          year: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          status?: string
          grade?: string | null
          quarter?: string | null
          year?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          status?: string
          grade?: string | null
          quarter?: string | null
          year?: number | null
          created_at?: string | null
        }
      }
      student_likes: {
        Row: {
          id: string
          liker_id: string
          liked_student_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          liker_id: string
          liked_student_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          liker_id?: string
          liked_student_id?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
