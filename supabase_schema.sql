-- ====================================================================
-- SUPABASE SCHEMA FOR "KASBGA QIZIQISH TESTI" APP
-- ====================================================================

-- 1. Create tables
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  class TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  test_completed BOOLEAN DEFAULT FALSE,
  interest_area TEXT,
  test_completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE test_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In Supabase, you can use the built-in auth.users table for admin login.
-- If you want a custom admins table to link with auth.users or store extra info:
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 2. Enable Row Level Security (RLS)
-- ====================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 3. RLS Policies
-- ====================================================================

-- Students Table Policies
-- Allow anyone to insert a new student (since students don't log in)
CREATE POLICY "Allow public insert to students" 
  ON students FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Allow public to read their own record if they know the ID, but generally 
-- public select could be restricted. We'll allow public to update a student
-- if they have the ID (used at the end of the test to save results).
-- In a stricter app, you'd use a secure token, but for this simple app:
CREATE POLICY "Allow public update to students"
  ON students FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admins to select/read all students
CREATE POLICY "Allow admins to read all students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

-- Test Answers Table Policies
-- Allow anyone to insert their answers
CREATE POLICY "Allow public insert to test_answers"
  ON test_answers FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to read all answers
CREATE POLICY "Allow admins to read all test_answers"
  ON test_answers FOR SELECT
  TO authenticated
  USING (true);

-- Admins Table Policies
-- Only authenticated users can read admin records
CREATE POLICY "Allow admins to read admins"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ====================================================================
-- Instructions:
-- 1. Run this script in the Supabase SQL Editor.
-- 2. Go to Authentication -> Providers -> Email, make sure it's enabled.
-- 3. In Authentication -> Users, invite/create your admin user (e.g., admin@test.com).
-- 4. Get your Project URL and anon key from Project Settings -> API, and put them in `src/services/supabase.js`.
-- ====================================================================
