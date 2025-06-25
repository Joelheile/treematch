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
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_liker_id ON student_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_liked_student_id ON student_likes(liked_student_id);
CREATE INDEX IF NOT EXISTS idx_student_likes_created_at ON student_likes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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