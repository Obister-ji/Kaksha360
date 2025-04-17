# Supabase Setup for Test Management

This document provides instructions on how to set up the Supabase database for the test management feature.

## Prerequisites

- A Supabase account and project
- Access to the Supabase SQL Editor

## Setup Instructions

1. **Log in to your Supabase dashboard** and select your project.

2. **Navigate to the SQL Editor** in the left sidebar.

3. **Create a new query** and paste the contents of the `supabase/migrations/create_test_tables.sql` file.

4. **Run the query** to create the necessary tables and policies.

## Tables Created

The SQL script will create the following tables:

1. **tests** - Stores test schedules
   - id (UUID, primary key)
   - title (TEXT)
   - instructor (TEXT)
   - date (TEXT)
   - time (TEXT)
   - duration (TEXT)
   - status (TEXT)
   - participants (TEXT[])
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - created_by (UUID, references auth.users)

2. **test_questions** - Stores questions for each test
   - id (UUID, primary key)
   - test_id (UUID, references tests)
   - text (TEXT)
   - subject (TEXT)
   - image_url (TEXT, nullable)
   - solution (TEXT, nullable)
   - marks (INTEGER, default 4)
   - negative_marks (INTEGER, default 1)
   - created_at (TIMESTAMP)

3. **test_options** - Stores options for each question
   - id (UUID, primary key)
   - question_id (UUID, references test_questions)
   - option_id (TEXT)
   - text (TEXT)
   - is_correct (BOOLEAN)
   - image_url (TEXT, nullable)
   - created_at (TIMESTAMP)

## Row Level Security (RLS) Policies

The script also sets up RLS policies to control access to the tables:

- Public read access for all tables
- Only authenticated users can create, update, or delete records
- Users can only update or delete tests they created

## Troubleshooting

If you encounter any issues:

1. **Check for errors** in the SQL Editor console.
2. **Verify that the tables were created** by checking the Database section in Supabase.
3. **Test the API** by making a simple query from your application.

If the application shows "Supabase tables not set up" message, it means the tables haven't been created correctly. Follow the setup instructions again and make sure there are no errors when running the SQL script.

## Using Local Storage Fallback

The application includes a fallback mechanism that uses local storage when Supabase tables are not available. This allows you to test the application functionality even without setting up Supabase.

However, for production use, it's recommended to set up the Supabase tables to ensure data persistence and multi-user support.
