-- Drop existing tables if they exist
DROP TABLE IF EXISTS translation_cache;
DROP TABLE IF EXISTS medical_reports;

-- Create translation_cache table
CREATE TABLE translation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    medical_terms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_reports table
CREATE TABLE medical_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    keywords TEXT[] DEFAULT '{}',
    summary TEXT,
    simplified_content TEXT,
    medical_terms JSONB DEFAULT '[]'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_translation_cache_medical_terms ON translation_cache USING GIN (medical_terms);
CREATE INDEX IF NOT EXISTS idx_medical_reports_medical_terms ON medical_reports USING GIN (medical_terms);
CREATE INDEX IF NOT EXISTS idx_medical_reports_timestamp ON medical_reports (timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous access to translation_cache" ON translation_cache
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous access to medical_reports" ON medical_reports
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true); 