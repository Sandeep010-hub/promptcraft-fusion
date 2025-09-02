-- Update prompts table to match Vault component expectations
ALTER TABLE public.prompts 
ADD COLUMN title TEXT,
ADD COLUMN content TEXT,
ADD COLUMN category TEXT DEFAULT 'Creative Writing',
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN usage_count INTEGER DEFAULT 0,
ADD COLUMN starred BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE public.prompts 
SET 
  title = COALESCE(title, 'Untitled Prompt'),
  content = COALESCE(content, original_prompt),
  category = COALESCE(category, 'Creative Writing'),
  tags = COALESCE(tags, '{}'),
  usage_count = COALESCE(usage_count, 0),
  starred = COALESCE(starred, false);

-- Make new columns NOT NULL after setting default values
ALTER TABLE public.prompts 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN content SET NOT NULL,
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN tags SET NOT NULL,
ALTER COLUMN usage_count SET NOT NULL,
ALTER COLUMN starred SET NOT NULL;

-- Create indexes for new columns
CREATE INDEX idx_prompts_category ON public.prompts(category);
CREATE INDEX idx_prompts_starred ON public.prompts(starred);
CREATE INDEX idx_prompts_usage_count ON public.prompts(usage_count);

-- Add full-text search index for content
CREATE INDEX idx_prompts_content_search ON public.prompts USING gin(to_tsvector('english', content));

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;

-- Recreate policies with updated column references
CREATE POLICY "Users can view their own prompts" 
ON public.prompts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts" 
ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" 
ON public.prompts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" 
ON public.prompts FOR DELETE USING (auth.uid() = user_id);
