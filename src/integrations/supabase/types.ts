export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          coolest_thing: string | null
          country: string | null
          created_at: string | null
          current_project: string | null
          email: string | null
          github: string | null
          id: string
          linkedin: string | null
          name: string | null
          phone_number: string | null
          profile_image: string | null
          skills: string[] | null
          summer_goals: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          coolest_thing?: string | null
          country?: string | null
          created_at?: string | null
          current_project?: string | null
          email?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          name?: string | null
          phone_number?: string | null
          profile_image?: string | null
          skills?: string[] | null
          summer_goals?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          coolest_thing?: string | null
          country?: string | null
          created_at?: string | null
          current_project?: string | null
          email?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          name?: string | null
          phone_number?: string | null
          profile_image?: string | null
          skills?: string[] | null
          summer_goals?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      students_with_metadata: {
        Row: {
          coolest_thing: string | null
          country: string | null
          created_at: string | null
          current_project: string | null
          email: string | null
          github: string | null
          goals_count: number | null
          has_social_links: boolean | null
          id: string | null
          linkedin: string | null
          name: string | null
          phone_number: string | null
          profile_image: string | null
          skills: string[] | null
          skills_count: number | null
          summer_goals: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          coolest_thing?: string | null
          country?: string | null
          created_at?: string | null
          current_project?: string | null
          email?: string | null
          github?: string | null
          goals_count?: never
          has_social_links?: never
          id?: string | null
          linkedin?: string | null
          name?: string | null
          phone_number?: string | null
          profile_image?: string | null
          skills?: string[] | null
          skills_count?: never
          summer_goals?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          coolest_thing?: string | null
          country?: string | null
          created_at?: string | null
          current_project?: string | null
          email?: string | null
          github?: string | null
          goals_count?: never
          has_social_links?: never
          id?: string | null
          linkedin?: string | null
          name?: string | null
          phone_number?: string | null
          profile_image?: string | null
          skills?: string[] | null
          skills_count?: never
          summer_goals?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
