/**
 * This script creates the announcements table in Supabase
 * Run this script if you're getting "Failed to create announcement in Supabase" errors
 * 
 * Usage:
 * node scripts/create-announcements-table.js
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
  console.log(colorize('\n=== Creating Announcements Table in Supabase ===\n', colors.bright + colors.fg.blue));
  
  // Get Supabase credentials
  const { url, key } = await getSupabaseCredentials();
  
  // Create Supabase client
  const supabase = createClient(url, key);
  
  try {
    // Step 1: Check if announcements table exists
    console.log(colorize('\n1. Checking if announcements table exists...', colors.fg.yellow));
    
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(colorize('✗ Announcements table does not exist.', colors.fg.red));
        console.log(colorize('Creating announcements table...', colors.fg.yellow));
      } else if (error) {
        throw error;
      } else {
        console.log(colorize('✓ Announcements table already exists!', colors.fg.green));
        console.log(colorize('Skipping table creation.', colors.fg.yellow));
        return;
      }
    } catch (error) {
      if (error.code !== '42P01') {
        console.error(colorize(`Error checking table: ${error.message}`, colors.fg.red));
      }
    }
    
    // Step 2: Create the announcements table
    console.log(colorize('\n2. Creating announcements table...', colors.fg.yellow));
    
    const createTableSQL = `
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
      console.log(colorize('✓ Announcements table created successfully!', colors.fg.green));
    }
    
    // Step 3: Insert initial data
    console.log(colorize('\n3. Inserting initial announcements...', colors.fg.yellow));
    
    const initialAnnouncements = [
      {
        title: 'JEE Main Test Series Update',
        content: 'We\'ve updated the JEE Main Test Series with new questions. Please check the test schedule for upcoming tests.',
        date: '2025/01/15',
        author: 'LAKSHYA',
        important: true
      },
      {
        title: 'Holiday Schedule for Republic Day',
        content: 'Please note that all classes will be closed on January 26th for Republic Day. Normal schedule resumes on January 27th.',
        date: '2025/01/10',
        author: 'LAKSHYA',
        important: false
      },
      {
        title: 'Study Material Update: P-Block Elements',
        content: 'New study materials for P-Block Elements have been uploaded. You can access them in the Study Material section.',
        date: '2025/01/05',
        author: 'LAKSHYA',
        important: false
      }
    ];
    
    const { error: insertError } = await supabase
      .from('announcements')
      .insert(initialAnnouncements);
    
    if (insertError) {
      console.log(colorize(`✗ Failed to insert initial announcements: ${insertError.message}`, colors.fg.red));
    } else {
      console.log(colorize('✓ Initial announcements inserted successfully!', colors.fg.green));
    }
    
    console.log(colorize('\n=== Setup Complete! ===', colors.bright + colors.fg.green));
    console.log(colorize('You should now be able to create, update, and delete announcements.', colors.fg.green));
    
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
