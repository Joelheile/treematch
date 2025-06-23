import { createClient as createServerClient } from '@/integrations/supabase/server'
import { StudentService } from './student-service'

export const createServerStudentService = () => {
  return new StudentService(createServerClient())
}

export const serverStudentService = new StudentService(createServerClient()) 