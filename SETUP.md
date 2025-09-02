# PromptCraft AI - Setup Guide

## Overview
PromptCraft AI is a fully functional application with a collapsible sidebar, multi-model prompt generation, and a comprehensive vault system for storing prompts and outputs.

## Features Implemented

### ✅ Part 1: Collapsible Sidebar
- Refactored Dashboard to use existing Sidebar components
- Smooth transitions and responsive design
- Keyboard shortcuts (Ctrl/Cmd + B) for toggling

### ✅ Part 2: Prompt Generator with Model Selection
- Multi-model selector (All, Gemini, ChatGPT, Claude)
- OpenAI API integration for prompt generation
- Dynamic meta-prompts based on target model
- Save to Vault functionality

### ✅ Part 3: Full Vault Experience
- Real-time data from Supabase database
- Search and filtering capabilities
- Prompt detail pages with file upload
- Multimedia output storage

## Prerequisites

1. **Supabase Project**: Set up a Supabase project with authentication enabled
2. **OpenAI API Key**: Get an API key from [OpenAI Platform](https://platform.openai.com/)
3. **Environment Variables**: Configure your `.env.local` file

## Environment Setup

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (for Edge Functions)
OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

### 1. Run Migrations
Execute the SQL migrations in order:

```bash
# Run the prompts table migration
psql -h your_host -U your_user -d your_db -f supabase/migrations/20250103000000_create_prompts_table.sql

# Run the storage bucket migration
psql -h your_host -U your_user -d your_db -f supabase/migrations/20250103000001_create_storage_bucket.sql
```

### 2. Verify Tables
Check that the following tables exist:
- `profiles` (from existing migration)
- `prompts` (new)
- `storage.buckets` (should include `prompt_outputs`)

## Supabase Edge Functions Setup

### 1. Deploy Edge Functions
Deploy the Edge Functions to your Supabase project:

```bash
# Navigate to your Supabase project directory
cd supabase

# Deploy all functions
supabase functions deploy

# Or deploy individually:
supabase functions deploy generate-prompt
supabase functions deploy save-prompt
supabase functions deploy get-prompts
supabase functions deploy upload-output
```

### 2. Set Environment Variables for Edge Functions
In your Supabase dashboard, go to Settings > Edge Functions and set:

```bash
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Storage Bucket Setup

### 1. Create Storage Bucket
The migration should create the `prompt_outputs` bucket automatically. If not, create it manually in the Supabase dashboard:

- Go to Storage in your Supabase dashboard
- Create a new bucket named `prompt_outputs`
- Set it to public
- Set file size limit to 50MB
- Allow all MIME types

### 2. Verify Storage Policies
Ensure the RLS policies are applied correctly for the storage bucket.

## Frontend Configuration

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## API Endpoints

The application uses the following Supabase Edge Function endpoints:

- `POST /functions/v1/generate-prompt` - Generate optimized prompts
- `POST /functions/v1/save-prompt` - Save prompts to vault
- `GET /functions/v1/get-prompts` - Retrieve user prompts
- `POST /functions/v1/upload-output` - Upload output files

## Usage Flow

1. **Authentication**: Users sign in via Supabase Auth
2. **Prompt Generation**: Select target model and generate prompts
3. **Save to Vault**: Generated prompts are saved to the database
4. **Vault Management**: View, search, and manage saved prompts
5. **Output Upload**: Upload AI-generated outputs to link with prompts

## Troubleshooting

### Common Issues

1. **Edge Functions Not Deployed**
   - Ensure you're in the correct Supabase project
   - Check function deployment status in dashboard

2. **Authentication Errors**
   - Verify Supabase client configuration
   - Check that auth is enabled in your project

3. **Database Connection Issues**
   - Verify database connection string
   - Check that migrations have been applied

4. **Storage Upload Failures**
   - Ensure storage bucket exists and is public
   - Verify RLS policies are correctly configured

### Debug Mode

Enable debug logging in your browser console to see detailed error messages.

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure API calls with user tokens
- **File Isolation**: Users can only access files in their own folders
- **Input Validation**: All user inputs are validated and sanitized

## Performance Considerations

- **Database Indexing**: Indexes on `user_id` and `created_at` for fast queries
- **File Size Limits**: 50MB limit per file to prevent abuse
- **Caching**: Browser-level caching for static assets

## Next Steps

Potential enhancements for future versions:
- Prompt templates and categories
- Advanced search and filtering
- Export/import functionality
- Team collaboration features
- Analytics and usage tracking

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check browser console for error messages
4. Verify all environment variables are set correctly
