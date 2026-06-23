-- Run this entire script in your Supabase SQL Editor

-- 1. Create the Prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_prompt TEXT NOT NULL,
    generated_prompt TEXT NOT NULL,
    target_model TEXT NOT NULL,
    output_url TEXT,
    output_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on the Prompts table
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Prompts
-- Allow users to insert their own prompts
CREATE POLICY "Users can insert their own prompts" 
ON public.prompts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own prompts
CREATE POLICY "Users can view their own prompts" 
ON public.prompts FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own prompts
CREATE POLICY "Users can update their own prompts" 
ON public.prompts FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete their own prompts" 
ON public.prompts FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Set up Storage for prompt outputs
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prompt_outputs', 'prompt_outputs', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies
-- Allow authenticated users to upload files to their own folder path
CREATE POLICY "Users can upload their own outputs" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read the files since it's a public bucket
CREATE POLICY "Anyone can view outputs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'prompt_outputs');

-- Allow users to update their own files
CREATE POLICY "Users can update their own outputs" 
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own outputs" 
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
