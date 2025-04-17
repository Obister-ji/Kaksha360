/**
 * This script tests the Supabase integration for announcements
 * It creates, reads, updates, and deletes announcements in Supabase
 * 
 * Usage:
 * node scripts/test-announcements-integration.js
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
  console.log(colorize('\n=== Testing Supabase Announcements Integration ===\n', colors.bright + colors.fg.blue));
  
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
      
      if (error) {
        throw error;
      }
      
      console.log(colorize('✓ Announcements table exists!', colors.fg.green));
    } catch (error) {
      console.log(colorize(`✗ Announcements table does not exist or is not accessible: ${error.message}`, colors.fg.red));
      console.log(colorize('Creating announcements table...', colors.fg.yellow));
      
      // Create the announcements table
      const { error: createError } = await supabase.rpc('create_announcements_table');
      
      if (createError) {
        throw new Error(`Failed to create announcements table: ${createError.message}`);
      }
      
      console.log(colorize('✓ Announcements table created successfully!', colors.fg.green));
    }
    
    // Step 2: Create a test announcement
    console.log(colorize('\n2. Creating test announcement...', colors.fg.yellow));
    
    const testAnnouncement = {
      title: 'Test Announcement',
      content: 'This is a test announcement created by the test script.',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      author: 'Test Script',
      important: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: createData, error: createError } = await supabase
      .from('announcements')
      .insert(testAnnouncement)
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create announcement: ${createError.message}`);
    }
    
    console.log(colorize('✓ Announcement created successfully!', colors.fg.green));
    console.log(colorize(`ID: ${createData.id}`, colors.fg.cyan));
    
    const announcementId = createData.id;
    
    // Step 3: Read the announcement
    console.log(colorize('\n3. Reading the announcement...', colors.fg.yellow));
    
    const { data: readData, error: readError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single();
    
    if (readError) {
      throw new Error(`Failed to read announcement: ${readError.message}`);
    }
    
    console.log(colorize('✓ Announcement read successfully!', colors.fg.green));
    console.log(colorize('Announcement data:', colors.fg.cyan));
    console.log(readData);
    
    // Step 4: Update the announcement
    console.log(colorize('\n4. Updating the announcement...', colors.fg.yellow));
    
    const { data: updateData, error: updateError } = await supabase
      .from('announcements')
      .update({
        title: 'Updated Test Announcement',
        important: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', announcementId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update announcement: ${updateError.message}`);
    }
    
    console.log(colorize('✓ Announcement updated successfully!', colors.fg.green));
    console.log(colorize('Updated announcement data:', colors.fg.cyan));
    console.log(updateData);
    
    // Step 5: Delete the announcement
    console.log(colorize('\n5. Deleting the announcement...', colors.fg.yellow));
    
    const { error: deleteError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);
    
    if (deleteError) {
      throw new Error(`Failed to delete announcement: ${deleteError.message}`);
    }
    
    console.log(colorize('✓ Announcement deleted successfully!', colors.fg.green));
    
    // Step 6: Verify deletion
    console.log(colorize('\n6. Verifying deletion...', colors.fg.yellow));
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId);
    
    if (verifyError) {
      throw new Error(`Failed to verify deletion: ${verifyError.message}`);
    }
    
    if (verifyData.length === 0) {
      console.log(colorize('✓ Deletion verified! Announcement no longer exists.', colors.fg.green));
    } else {
      console.log(colorize('⚠ Deletion verification failed! Announcement still exists.', colors.fg.red));
    }
    
    console.log(colorize('\n=== All tests completed successfully! ===', colors.bright + colors.fg.green));
  } catch (error) {
    console.error(colorize(`\n❌ Error: ${error.message}`, colors.fg.red));
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error(colorize(`\nUnexpected error: ${error.message}`, colors.fg.red));
  rl.close();
});
