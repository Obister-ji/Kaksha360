# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using the Knowledge Surge Platform.

## Table of Contents

- [Supabase Integration Issues](#supabase-integration-issues)
  - [Failed to create announcement in Supabase](#failed-to-create-announcement-in-supabase)
  - [Failed to delete announcement from Supabase](#failed-to-delete-announcement-from-supabase)
  - [Failed to create video in Supabase](#failed-to-create-video-in-supabase)
  - [Failed to delete video from Supabase](#failed-to-delete-video-from-supabase)
  - [Failed to create study material in Supabase](#failed-to-create-study-material-in-supabase)
  - [Failed to delete study material from Supabase](#failed-to-delete-study-material-from-supabase)
- [Authentication Issues](#authentication-issues)
- [Data Persistence Issues](#data-persistence-issues)

## Supabase Integration Issues

### Failed to create announcement in Supabase

If you're seeing the error "Failed to create announcement in Supabase" when trying to create a new announcement, follow these steps to fix it:

#### Solution 1: Create the announcements table

The most common cause of this error is that the announcements table doesn't exist in your Supabase database. We've provided a script to create it:

```bash
npm run create:announcements-table
```

When prompted, enter your Supabase URL and anon key. You can find these in your Supabase dashboard under Project Settings > API.

#### Solution 2: Check RLS policies

If the table exists but you're still getting the error, it might be due to Row Level Security (RLS) policies. Make sure your RLS policies allow insert operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "announcements" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows insert operations
6. If not, add a policy with the following settings:
   - Name: "Allow public insert access to announcements"
   - Operation: INSERT
   - Using expression: `true`
   - With check expression: `true`

#### Solution 3: Check console for detailed error messages

Open your browser's developer console (F12 or Ctrl+Shift+I) to see more detailed error messages. Look for errors related to Supabase or the announcements table.

### Failed to delete announcement from Supabase

If you're seeing the error "Failed to delete announcement from Supabase" when trying to delete an announcement, follow these steps:

#### Solution 1: Check RLS policies

Make sure your RLS policies allow delete operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "announcements" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows delete operations
6. If not, add a policy with the following settings:
   - Name: "Allow public delete access to announcements"
   - Operation: DELETE
   - Using expression: `true`

#### Solution 2: Check if the announcement exists

The announcement might have already been deleted or might not exist in the database. Try refreshing the announcements list to see if it's still there.

### Failed to create video in Supabase

If you're seeing the error "Failed to create video in Supabase" when trying to add a new video, follow these steps to fix it:

#### Solution 1: Create the videos table

The most common cause of this error is that the videos table doesn't exist in your Supabase database. We've provided a script to create it:

```bash
npm run create:videos-table
```

When prompted, enter your Supabase URL and anon key. You can find these in your Supabase dashboard under Project Settings > API.

#### Solution 2: Check RLS policies

If the table exists but you're still getting the error, it might be due to Row Level Security (RLS) policies. Make sure your RLS policies allow insert operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "videos" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows insert operations
6. If not, add a policy with the following settings:
   - Name: "Allow public insert access to videos"
   - Operation: INSERT
   - Using expression: `true`
   - With check expression: `true`

#### Solution 3: Check console for detailed error messages

Open your browser's developer console (F12 or Ctrl+Shift+I) to see more detailed error messages. Look for errors related to Supabase or the videos table.

### Failed to delete video from Supabase

If you're seeing the error "Failed to delete video from Supabase" when trying to delete a video, follow these steps:

#### Solution 1: Check RLS policies

Make sure your RLS policies allow delete operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "videos" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows delete operations
6. If not, add a policy with the following settings:
   - Name: "Allow public delete access to videos"
   - Operation: DELETE
   - Using expression: `true`

#### Solution 2: Check if the video exists

The video might have already been deleted or might not exist in the database. Try refreshing the videos list to see if it's still there.

### Failed to create study material in Supabase

If you're seeing the error "Failed to create study material in Supabase" when trying to add a new study material, follow these steps to fix it:

#### Solution 1: Create the study_materials table

The most common cause of this error is that the study_materials table doesn't exist in your Supabase database. We've provided a script to create it:

```bash
npm run create:study-materials-table
```

When prompted, enter your Supabase URL and anon key. You can find these in your Supabase dashboard under Project Settings > API.

#### Solution 2: Check RLS policies

If the table exists but you're still getting the error, it might be due to Row Level Security (RLS) policies. Make sure your RLS policies allow insert operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "study_materials" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows insert operations
6. If not, add a policy with the following settings:
   - Name: "Allow public insert access to study_materials"
   - Operation: INSERT
   - Using expression: `true`
   - With check expression: `true`

#### Solution 3: Check console for detailed error messages

Open your browser's developer console (F12 or Ctrl+Shift+I) to see more detailed error messages. Look for errors related to Supabase or the study_materials table.

### Failed to delete study material from Supabase

If you're seeing the error "Failed to delete study material from Supabase" when trying to delete a study material, follow these steps:

#### Solution 1: Check RLS policies

Make sure your RLS policies allow delete operations:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the "study_materials" table
4. Click on "Policies" in the sidebar
5. Make sure there's a policy that allows delete operations
6. If not, add a policy with the following settings:
   - Name: "Allow public delete access to study_materials"
   - Operation: DELETE
   - Using expression: `true`

#### Solution 2: Check if the study material exists

The study material might have already been deleted or might not exist in the database. Try refreshing the study materials list to see if it's still there.

## Authentication Issues

If you're having issues with authentication:

1. Make sure your Supabase URL and anon key are correct in your environment variables
2. Check if you're signed in by looking at the user profile in the top right corner
3. Try signing out and signing back in
4. Clear your browser cache and cookies

## Data Persistence Issues

If your data isn't persisting between sessions:

1. Make sure you're connected to Supabase (check the console for connection errors)
2. Check if localStorage is enabled in your browser
3. Try using a different browser to see if the issue persists
4. Check if you have any browser extensions that might be blocking localStorage or Supabase connections

## Still Having Issues?

If you're still experiencing problems after trying these solutions, please:

1. Check the console for detailed error messages
2. Run the test script to verify your Supabase integration:
   ```bash
   npm run test:announcements
   ```
3. Contact support with the error messages and the results of the test script
