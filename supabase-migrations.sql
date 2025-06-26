-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  profile_image TEXT,
  summer_goals TEXT[],
  coolest_thing TEXT,
  phone_number TEXT,
  linkedin TEXT,
  github TEXT,
  website TEXT,
  isOnboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_first_mover_batch BOOLEAN DEFAULT false
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_global BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_skills junction table
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  department TEXT,
  is_global BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_courses junction table
CREATE TABLE IF NOT EXISTS student_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('completed', 'current', 'planned')) DEFAULT 'completed',
  grade TEXT,
  quarter TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create student_likes table for heart/like functionality
CREATE TABLE IF NOT EXISTS student_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(liker_id, liked_student_id)
);

-- Create storage buckets for avatars
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('temp-avatars', 'temp-avatars', true)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public;

-- Create storage policies for avatars bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for temp-avatars bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'temp-avatars');
CREATE POLICY "Anyone can upload temp avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'temp-avatars');
CREATE POLICY "Anyone can update temp avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'temp-avatars');
CREATE POLICY "Anyone can delete temp avatars" ON storage.objects FOR DELETE USING (bucket_id = 'temp-avatars');

-- Insert default skills
INSERT INTO skills (name, is_global, user_id) VALUES
  ('JavaScript', true, null),
  ('Python', true, null),
  ('React', true, null),
  ('Node.js', true, null),
  ('TypeScript', true, null),
  ('SQL', true, null),
  ('Git', true, null),
  ('AWS', true, null),
  ('Docker', true, null),
  ('Machine Learning', true, null),
  ('Data Science', true, null),
  ('UI/UX Design', true, null),
  ('Product Management', true, null),
  ('Marketing', true, null),
  ('Sales', true, null),
  ('Finance', true, null),
  ('Operations', true, null),
  ('Human Resources', true, null),
  ('Legal', true, null),
  ('Research', true, null)
ON CONFLICT DO NOTHING;

-- Insert default Stanford courses
INSERT INTO courses (name, code, department, is_global, user_id) VALUES
  ('Machine Learning', 'CS229', 'Computer Science', true, null),
  ('Algorithms', 'CS161', 'Computer Science', true, null),
  ('Programming Abstractions', 'CS106B', 'Computer Science', true, null),
  ('Programming Methodology', 'CS106A', 'Computer Science', true, null),
  ('Computer Organization and Systems', 'CS107', 'Computer Science', true, null),
  ('Principles of Computer Systems', 'CS110', 'Computer Science', true, null),
  ('Introduction to Database Systems', 'CS145', 'Computer Science', true, null),
  ('Human-Computer Interaction', 'CS147', 'Computer Science', true, null),
  ('Web Programming Fundamentals', 'CS142', 'Computer Science', true, null),
  ('Artificial Intelligence', 'CS221', 'Computer Science', true, null),
  ('Technology Entrepreneurship', 'ENGR145', 'Engineering', true, null),
  ('Design Thinking', 'ENGR110', 'Engineering', true, null),
  ('Startup Engineering', 'CS183B', 'Engineering', true, null),
  ('Product Design', 'ENGR248', 'Engineering', true, null),
  ('Calculus I', 'MATH19', 'Mathematics', true, null),
  ('Calculus II', 'MATH20', 'Mathematics', true, null),
  ('Calculus III', 'MATH21', 'Mathematics', true, null),
  ('Linear Algebra', 'MATH51', 'Mathematics', true, null),
  ('Probability and Statistics', 'STATS110', 'Statistics', true, null),
  ('Mechanics', 'PHYS41', 'Physics', true, null),
  ('Electricity and Magnetism', 'PHYS43', 'Physics', true, null),
  ('Principles of Economics', 'ECON1', 'Economics', true, null),
  ('Microeconomics', 'ECON50', 'Economics', true, null),
  ('Macroeconomics', 'ECON52', 'Economics', true, null),
  ('Finance', 'FINANCE385', 'Graduate School of Business', true, null),
  ('Marketing', 'MKTG365', 'Graduate School of Business', true, null),
  ('Writing and Rhetoric', 'PWR1', 'Program in Writing and Rhetoric', true, null),
  ('Data Science', 'DATASCI101', 'Data Science', true, null),
  ('Introduction to Psychology', 'PSYCH1', 'Psychology', true, null),
  ('Chemistry', 'CHEM31A', 'Chemistry', true, null),
  ('Biology', 'BIO82', 'Biology', true, null)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_country ON students(country);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_is_global ON skills(is_global);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill_id ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_liker_id ON student_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_liked_student_id ON student_likes(liked_student_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_created_at ON student_likes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students
CREATE POLICY "Students are viewable by everyone" 
ON students FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own student profile"
ON students FOR INSERT
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own student profile"
ON students FOR UPDATE
USING (auth.uid()::text = id);

CREATE POLICY "Users can delete their own student profile"
ON students FOR DELETE
USING (auth.uid()::text = id);

-- Create RLS policies for skills
CREATE POLICY "Skills are viewable by everyone" 
ON skills FOR SELECT 
USING (true);

CREATE POLICY "Global skills can be created by authenticated users"
ON skills FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND is_global = true);

CREATE POLICY "Users can create their own custom skills"
ON skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom skills"
ON skills FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for student_skills
CREATE POLICY "Student skills are viewable by everyone"
ON student_skills FOR SELECT
USING (true);

CREATE POLICY "Students can manage their own skills"
ON student_skills FOR ALL
USING (auth.uid()::text = (SELECT id FROM students WHERE id = student_skills.student_id));

-- Create RLS policies for courses
CREATE POLICY "Courses are viewable by everyone" 
ON courses FOR SELECT 
USING (true);

CREATE POLICY "Global courses can be created by authenticated users"
ON courses FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND is_global = true);

CREATE POLICY "Users can create their own custom courses"
ON courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom courses"
ON courses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Student courses are viewable by the student"
ON student_courses FOR SELECT
USING (auth.uid()::text = (SELECT id FROM students WHERE id = student_courses.student_id));

CREATE POLICY "Students can manage their own course enrollments"
ON student_courses FOR ALL
USING (auth.uid()::text = (SELECT id FROM students WHERE id = student_courses.student_id));

-- Student likes policies
CREATE POLICY "Users can view their own likes"
ON student_likes FOR SELECT
USING (auth.uid() = liker_id);

CREATE POLICY "Users can create their own likes"
ON student_likes FOR INSERT
WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes"
ON student_likes FOR DELETE
USING (auth.uid() = liker_id);

-- Remove current_project column from students table
ALTER TABLE students DROP COLUMN IF EXISTS current_project;