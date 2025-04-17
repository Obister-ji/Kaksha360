/**
 * This script creates the videos table in Supabase
 * Run this script if you're getting "Failed to create video in Supabase" errors
 * 
 * Usage:
 * node scripts/create-videos-table.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fg: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
  }
};

// Helper function to print colored text
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for Supabase URL and key
function getSupabaseCredentials() {
  return new Promise((resolve) => {
    rl.question(colorize('Enter your Supabase URL: ', colors.fg.cyan), (url) => {
      rl.question(colorize('Enter your Supabase anon key: ', colors.fg.cyan), (key) => {
        resolve({ url, key });
      });
    });
  });
}

// Main function
async function main() {
  console.log(colorize('\n=== Creating Videos Table in Supabase ===\n', colors.bright + colors.fg.blue));
  
  // Get Supabase credentials
  const { url, key } = await getSupabaseCredentials();
  
  // Create Supabase client
  const supabase = createClient(url, key);
  
  try {
    // Step 1: Check if videos table exists
    console.log(colorize('\n1. Checking if videos table exists...', colors.fg.yellow));
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(colorize('✗ Videos table does not exist.', colors.fg.red));
        console.log(colorize('Creating videos table...', colors.fg.yellow));
      } else if (error) {
        throw error;
      } else {
        console.log(colorize('✓ Videos table already exists!', colors.fg.green));
        console.log(colorize('Skipping table creation.', colors.fg.yellow));
        return;
      }
    } catch (error) {
      if (error.code !== '42P01') {
        console.error(colorize(`Error checking table: ${error.message}`, colors.fg.red));
      }
    }
    
    // Step 2: Create the videos table
    console.log(colorize('\n2. Creating videos table...', colors.fg.yellow));
    
    const createTableSQL = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      if (createError.message.includes('function "exec_sql" does not exist')) {
        console.log(colorize('✗ The exec_sql function does not exist in your Supabase project.', colors.fg.red));
        console.log(colorize('Please run the SQL commands manually in the Supabase SQL editor:', colors.fg.yellow));
        console.log('\n' + createTableSQL + '\n');
      } else {
        throw createError;
      }
    } else {
      console.log(colorize('✓ Videos table created successfully!', colors.fg.green));
    }
    
    // Step 3: Insert initial data
    console.log(colorize('\n3. Inserting initial videos...', colors.fg.yellow));
    
    const initialVideos = [
      {
        title: 'JEE Physics: Understanding Kinematics',
        description: 'A comprehensive explanation of kinematics concepts for JEE preparation.',
        youtubeId: 'dQw4w9WgXcQ',
        subject: 'Physics',
        uploadedBy: 'LAKSHYA',
        date: '2025/01/15'
      },
      {
        title: 'Chemistry: P-Block Elements',
        description: 'Detailed lecture on P-Block elements for competitive exams.',
        youtubeId: 'dQw4w9WgXcQ',
        subject: 'Chemistry',
        uploadedBy: 'LAKSHYA',
        date: '2025/01/10'
      },
      {
        title: 'Mathematics: Integral Calculus for JEE',
        description: 'Master integral calculus for JEE Main and Advanced.',
        youtubeId: 'dQw4w9WgXcQ',
        subject: 'Mathematics',
        uploadedBy: 'LAKSHYA',
        date: '2025/01/05'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('videos')
      .insert(initialVideos);
    
    if (insertError) {
      console.log(colorize(`✗ Failed to insert initial videos: ${insertError.message}`, colors.fg.red));
    } else {
      console.log(colorize('✓ Initial videos inserted successfully!', colors.fg.green));
    }
    
    console.log(colorize('\n=== Setup Complete! ===', colors.bright + colors.fg.green));
    console.log(colorize('You should now be able to create, update, and delete videos.', colors.fg.green));
    
  } catch (error) {
    console.error(colorize(`\n❌ Error: ${error.message}`, colors.fg.red));
    if (error.details) {
      console.error(colorize(`Details: ${error.details}`, colors.fg.red));
    }
    if (error.hint) {
      console.error(colorize(`Hint: ${error.hint}`, colors.fg.red));
    }
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error(colorize(`\nUnexpected error: ${error.message}`, colors.fg.red));
  rl.close();
});
