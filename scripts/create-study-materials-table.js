/**
 * This script creates the study_materials table in Supabase
 * Run this script if you're getting "Failed to create study material in Supabase" errors
 * 
 * Usage:
 * node scripts/create-study-materials-table.js
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
  console.log(colorize('\n=== Creating Study Materials Table in Supabase ===\n', colors.bright + colors.fg.blue));
  
  // Get Supabase credentials
  const { url, key } = await getSupabaseCredentials();
  
  // Create Supabase client
  const supabase = createClient(url, key);
  
  try {
    // Step 1: Check if study_materials table exists
    console.log(colorize('\n1. Checking if study_materials table exists...', colors.fg.yellow));
    
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(colorize('✗ Study materials table does not exist.', colors.fg.red));
        console.log(colorize('Creating study_materials table...', colors.fg.yellow));
      } else if (error) {
        throw error;
      } else {
        console.log(colorize('✓ Study materials table already exists!', colors.fg.green));
        console.log(colorize('Skipping table creation.', colors.fg.yellow));
        return;
      }
    } catch (error) {
      if (error.code !== '42P01') {
        console.error(colorize(`Error checking table: ${error.message}`, colors.fg.red));
      }
    }
    
    // Step 2: Create the study_materials table
    console.log(colorize('\n2. Creating study_materials table...', colors.fg.yellow));
    
    const createTableSQL = `
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
      console.log(colorize('✓ Study materials table created successfully!', colors.fg.green));
    }
    
    // Step 3: Insert initial data
    console.log(colorize('\n3. Inserting initial study materials...', colors.fg.yellow));
    
    const initialMaterials = [
      {
        title: 'JEE Physics: Mechanics Notes',
        description: 'Comprehensive notes on mechanics concepts for JEE preparation.',
        fileUrl: 'https://example.com/physics_notes.pdf',
        subject: 'Physics',
        uploadedBy: 'LAKSHYA',
        uploadDate: '2025/01/15',
        fileType: 'pdf'
      },
      {
        title: 'Chemistry: P-Block Elements',
        description: 'Detailed notes on P-Block elements for competitive exams.',
        fileUrl: 'https://example.com/chemistry_notes.pdf',
        subject: 'Chemistry',
        uploadedBy: 'LAKSHYA',
        uploadDate: '2025/01/10',
        fileType: 'pdf'
      },
      {
        title: 'Mathematics: Integral Calculus Formulas',
        description: 'Formula sheet for integral calculus for JEE Main and Advanced.',
        fileUrl: 'https://example.com/math_formulas.pdf',
        subject: 'Mathematics',
        uploadedBy: 'LAKSHYA',
        uploadDate: '2025/01/05',
        fileType: 'pdf'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('study_materials')
      .insert(initialMaterials);
    
    if (insertError) {
      console.log(colorize(`✗ Failed to insert initial study materials: ${insertError.message}`, colors.fg.red));
    } else {
      console.log(colorize('✓ Initial study materials inserted successfully!', colors.fg.green));
    }
    
    console.log(colorize('\n=== Setup Complete! ===', colors.bright + colors.fg.green));
    console.log(colorize('You should now be able to create, update, and delete study materials.', colors.fg.green));
    
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
