-- Create medical_reports table
CREATE TABLE IF NOT EXISTS medical_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('pdf', 'image', 'text')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    keywords TEXT[] DEFAULT '{}',
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable full-text search
ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS fts_content tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
CREATE INDEX IF NOT EXISTS medical_reports_fts ON medical_reports USING GIN (fts_content);

-- Enable RLS
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON medical_reports;
DROP POLICY IF EXISTS "Allow public insert access" ON medical_reports;
DROP POLICY IF EXISTS "Allow public update access" ON medical_reports;
DROP POLICY IF EXISTS "Allow public delete access" ON medical_reports;

-- Create new policies for public access
CREATE POLICY "Allow public read access" ON medical_reports
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access" ON medical_reports
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access" ON medical_reports
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON medical_reports
    FOR DELETE
    USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_medical_reports_updated_at
    BEFORE UPDATE ON medical_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();