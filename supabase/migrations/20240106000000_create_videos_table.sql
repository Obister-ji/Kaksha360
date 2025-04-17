-- Drop the videos table if it exists
DROP TABLE IF EXISTS videos;

-- Create the videos table with the correct structure
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtubeId TEXT NOT NULL,
  subject TEXT NOT NULL,
  uploadedBy TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NULL
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations without authentication
CREATE POLICY "Allow public read access to videos" 
  ON videos FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to videos" 
  ON videos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to videos" 
  ON videos FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to videos" 
  ON videos FOR DELETE 
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS videos_date_idx ON videos (date);

-- Insert some initial videos
INSERT INTO videos (title, description, youtubeId, subject, uploadedBy, date)
VALUES
  ('JEE Physics: Understanding Kinematics', 'A comprehensive explanation of kinematics concepts for JEE preparation.', 'dQw4w9WgXcQ', 'Physics', 'LAKSHYA', '2025/01/15'),
  ('Chemistry: P-Block Elements', 'Detailed lecture on P-Block elements for competitive exams.', 'dQw4w9WgXcQ', 'Chemistry', 'LAKSHYA', '2025/01/10'),
  ('Mathematics: Integral Calculus for JEE', 'Master integral calculus for JEE Main and Advanced.', 'dQw4w9WgXcQ', 'Mathematics', 'LAKSHYA', '2025/01/05');
