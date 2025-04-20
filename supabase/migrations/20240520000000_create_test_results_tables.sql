-- Drop the test_results table if it exists
DROP TABLE IF EXISTS test_results;

-- Create the test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  total_score NUMERIC NOT NULL,
  accuracy NUMERIC NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  unattempted_questions INTEGER NOT NULL,
  answers JSONB NOT NULL, -- Store the user's answers as JSON
  subject_performance JSONB, -- Store subject-wise performance as JSON
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, test_id) -- Each user can have only one result per test
);

-- Create the rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_rank INTEGER NOT NULL,
  batch_total INTEGER NOT NULL,
  institute_rank INTEGER NOT NULL,
  institute_total INTEGER NOT NULL,
  percentile NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, test_id) -- Each user can have only one ranking per test
);

-- Create the batches table to group users
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the user_batches table to associate users with batches
CREATE TABLE IF NOT EXISTS user_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, batch_id) -- Each user can be in a batch only once
);

-- Create the institutes table
CREATE TABLE IF NOT EXISTS institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the user_institutes table to associate users with institutes
CREATE TABLE IF NOT EXISTS user_institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, institute_id) -- Each user can be in an institute only once
);

-- Add RLS policies
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_institutes ENABLE ROW LEVEL SECURITY;

-- Create policies for test_results table
CREATE POLICY "Users can view their own test results" ON test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results" ON test_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all test results" ON test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Create policies for rankings table
CREATE POLICY "Users can view their own rankings" ON rankings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rankings" ON rankings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can insert rankings" ON rankings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update rankings" ON rankings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Create policies for batches table
CREATE POLICY "Anyone can view batches" ON batches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage batches" ON batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Create policies for user_batches table
CREATE POLICY "Users can view their own batch associations" ON user_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user batch associations" ON user_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage user batch associations" ON user_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Create policies for institutes table
CREATE POLICY "Anyone can view institutes" ON institutes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage institutes" ON institutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Create policies for user_institutes table
CREATE POLICY "Users can view their own institute associations" ON user_institutes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user institute associations" ON user_institutes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage user institute associations" ON user_institutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id AND auth.users.role = 'ADMIN'
    )
  );

-- Insert some default batches
INSERT INTO batches (name, description)
VALUES 
  ('Class 12 - Science', 'Students preparing for science stream exams'),
  ('Class 12 - Commerce', 'Students preparing for commerce stream exams'),
  ('JEE Batch 2024', 'Students preparing for JEE 2024'),
  ('NEET Batch 2024', 'Students preparing for NEET 2024');

-- Insert some default institutes
INSERT INTO institutes (name, description)
VALUES 
  ('LAKSHYA Main Center', 'Main coaching center'),
  ('LAKSHYA South Campus', 'South region coaching center'),
  ('LAKSHYA Online', 'Online coaching program');

-- Create a function to calculate rankings
CREATE OR REPLACE FUNCTION calculate_rankings()
RETURNS TRIGGER AS $$
DECLARE
  v_batch_id UUID;
  v_institute_id UUID;
  v_batch_rank INTEGER;
  v_batch_total INTEGER;
  v_institute_rank INTEGER;
  v_institute_total INTEGER;
  v_percentile NUMERIC;
BEGIN
  -- Get the user's batch
  SELECT batch_id INTO v_batch_id FROM user_batches WHERE user_id = NEW.user_id LIMIT 1;
  
  -- Get the user's institute
  SELECT institute_id INTO v_institute_id FROM user_institutes WHERE user_id = NEW.user_id LIMIT 1;
  
  -- Calculate batch rank if user is in a batch
  IF v_batch_id IS NOT NULL THEN
    -- Calculate the user's rank within their batch
    SELECT 
      COUNT(*) + 1 INTO v_batch_rank
    FROM 
      test_results tr
      JOIN user_batches ub ON tr.user_id = ub.user_id
    WHERE 
      tr.test_id = NEW.test_id
      AND ub.batch_id = v_batch_id
      AND tr.score > NEW.score;
      
    -- Calculate total number of users in the batch who took this test
    SELECT 
      COUNT(*) INTO v_batch_total
    FROM 
      test_results tr
      JOIN user_batches ub ON tr.user_id = ub.user_id
    WHERE 
      tr.test_id = NEW.test_id
      AND ub.batch_id = v_batch_id;
  ELSE
    -- Default values if user is not in a batch
    v_batch_rank := 1;
    v_batch_total := 1;
  END IF;
  
  -- Calculate institute rank if user is in an institute
  IF v_institute_id IS NOT NULL THEN
    -- Calculate the user's rank within their institute
    SELECT 
      COUNT(*) + 1 INTO v_institute_rank
    FROM 
      test_results tr
      JOIN user_institutes ui ON tr.user_id = ui.user_id
    WHERE 
      tr.test_id = NEW.test_id
      AND ui.institute_id = v_institute_id
      AND tr.score > NEW.score;
      
    -- Calculate total number of users in the institute who took this test
    SELECT 
      COUNT(*) INTO v_institute_total
    FROM 
      test_results tr
      JOIN user_institutes ui ON tr.user_id = ui.user_id
    WHERE 
      tr.test_id = NEW.test_id
      AND ui.institute_id = v_institute_id;
  ELSE
    -- Default values if user is not in an institute
    v_institute_rank := 1;
    v_institute_total := 1;
  END IF;
  
  -- Calculate percentile (higher score = higher percentile)
  SELECT 
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM test_results WHERE test_id = NEW.test_id)), 2)
    INTO v_percentile
  FROM 
    test_results
  WHERE 
    test_id = NEW.test_id
    AND score <= NEW.score;
  
  -- Insert or update the ranking
  INSERT INTO rankings (
    test_id, 
    user_id, 
    batch_rank, 
    batch_total, 
    institute_rank, 
    institute_total, 
    percentile
  )
  VALUES (
    NEW.test_id,
    NEW.user_id,
    v_batch_rank,
    v_batch_total,
    v_institute_rank,
    v_institute_total,
    v_percentile
  )
  ON CONFLICT (user_id, test_id) 
  DO UPDATE SET
    batch_rank = v_batch_rank,
    batch_total = v_batch_total,
    institute_rank = v_institute_rank,
    institute_total = v_institute_total,
    percentile = v_percentile,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to calculate rankings when a test result is inserted or updated
CREATE TRIGGER calculate_rankings_trigger
AFTER INSERT OR UPDATE ON test_results
FOR EACH ROW
EXECUTE FUNCTION calculate_rankings();

-- Create a function to recalculate all rankings for a test
CREATE OR REPLACE FUNCTION recalculate_test_rankings(p_test_id UUID)
RETURNS VOID AS $$
DECLARE
  v_result RECORD;
BEGIN
  FOR v_result IN SELECT * FROM test_results WHERE test_id = p_test_id
  LOOP
    -- Update the row to trigger the calculate_rankings function
    UPDATE test_results
    SET updated_at = NOW()
    WHERE id = v_result.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
