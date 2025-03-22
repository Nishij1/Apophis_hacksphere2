-- Add simplified content and medical terms columns to medical_reports
ALTER TABLE medical_reports 
ADD COLUMN IF NOT EXISTS simplified_content TEXT,
ADD COLUMN IF NOT EXISTS medical_terms JSONB DEFAULT '[]';

-- Update full-text search to include simplified content
DROP INDEX IF EXISTS medical_reports_fts;
ALTER TABLE medical_reports DROP COLUMN IF EXISTS fts_content;
ALTER TABLE medical_reports ADD COLUMN fts_content tsvector 
    GENERATED ALWAYS AS (
        to_tsvector('english', content) || 
        to_tsvector('english', COALESCE(simplified_content, ''))
    ) STORED;
CREATE INDEX medical_reports_fts ON medical_reports USING GIN (fts_content);

-- Create index on medical terms for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_reports_medical_terms ON medical_reports USING GIN (medical_terms);