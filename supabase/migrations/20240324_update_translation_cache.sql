-- Add medical terms column to translation_cache table
ALTER TABLE translation_cache 
ADD COLUMN IF NOT EXISTS medical_terms JSONB DEFAULT '[]'::jsonb;

-- Create index on medical terms for better query performance
CREATE INDEX IF NOT EXISTS idx_translation_cache_medical_terms ON translation_cache USING GIN (medical_terms);