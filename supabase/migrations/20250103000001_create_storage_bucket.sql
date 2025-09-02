-- Create prompt_outputs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompt_outputs',
  'prompt_outputs',
  true,
  52428800, -- 50MB limit
  ARRAY['*/*'] -- Allow all file types
);

-- Set up Row Level Security for the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Users can only see files in their own user folder
CREATE POLICY "Users can view their own output files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can upload files to their own user folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update files in their own user folder
CREATE POLICY "Users can update their own output files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete files in their own user folder
CREATE POLICY "Users can delete their own output files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prompt_outputs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
