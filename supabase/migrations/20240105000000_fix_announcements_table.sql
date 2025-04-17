-- Drop the announcements table if it exists
DROP TABLE IF EXISTS announcements;

-- Create the announcements table with the correct structure
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NULL
);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations without authentication
-- This ensures announcements can be created even if the user is not authenticated
CREATE POLICY "Allow public read access to announcements" 
  ON announcements FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to announcements" 
  ON announcements FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to announcements" 
  ON announcements FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to announcements" 
  ON announcements FOR DELETE 
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS announcements_date_idx ON announcements (date);

-- Insert some initial announcements
INSERT INTO announcements (title, content, date, author, important)
VALUES
  ('JEE Main Test Series Update', 'We''ve updated the JEE Main Test Series with new questions. Please check the test schedule for upcoming tests.', '2025/01/15', 'LAKSHYA', true),
  ('Holiday Schedule for Republic Day', 'Please note that all classes will be closed on January 26th for Republic Day. Normal schedule resumes on January 27th.', '2025/01/10', 'LAKSHYA', false),
  ('Study Material Update: P-Block Elements', 'New study materials for P-Block Elements have been uploaded. You can access them in the Study Material section.', '2025/01/05', 'LAKSHYA', false);
