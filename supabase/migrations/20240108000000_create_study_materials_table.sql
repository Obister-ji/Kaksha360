-- Drop the study_materials table if it exists
DROP TABLE IF EXISTS study_materials;

-- Create the study_materials table with the correct structure
CREATE TABLE IF NOT EXISTS study_materials (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "uploadDate" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" UUID REFERENCES auth.users(id) NULL
);

-- Enable Row Level Security
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations without authentication
CREATE POLICY "Allow public read access to study_materials" 
  ON study_materials FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to study_materials" 
  ON study_materials FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to study_materials" 
  ON study_materials FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to study_materials" 
  ON study_materials FOR DELETE 
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS study_materials_upload_date_idx ON study_materials ("uploadDate");

-- Insert some initial study materials
INSERT INTO study_materials ("title", "description", "fileUrl", "subject", "uploadedBy", "uploadDate", "fileType")
VALUES
  ('JEE Physics: Mechanics Notes', 'Comprehensive notes on mechanics concepts for JEE preparation.', 'https://example.com/physics_notes.pdf', 'Physics', 'LAKSHYA', '2025/01/15', 'pdf'),
  ('Chemistry: P-Block Elements', 'Detailed notes on P-Block elements for competitive exams.', 'https://example.com/chemistry_notes.pdf', 'Chemistry', 'LAKSHYA', '2025/01/10', 'pdf'),
  ('Mathematics: Integral Calculus Formulas', 'Formula sheet for integral calculus for JEE Main and Advanced.', 'https://example.com/math_formulas.pdf', 'Mathematics', 'LAKSHYA', '2025/01/05', 'pdf');
