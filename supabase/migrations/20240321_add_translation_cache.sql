-- Create translation_cache table
CREATE TABLE IF NOT EXISTS translation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    translation_source TEXT NOT NULL CHECK (translation_source IN ('deepseek', 'chatgpt')),
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_text, source_language, target_language)
);

-- Add RLS policies
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read from cache
CREATE POLICY "Allow authenticated users to read cache" ON translation_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert into cache
CREATE POLICY "Allow authenticated users to insert into cache" ON translation_cache
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update cache
CREATE POLICY "Allow authenticated users to update cache" ON translation_cache
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update usage count and last_used
CREATE OR REPLACE FUNCTION update_translation_cache_usage(
    p_source_text TEXT,
    p_source_language TEXT,
    p_target_language TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE translation_cache
    SET 
        usage_count = usage_count + 1,
        last_used = NOW(),
        updated_at = NOW()
    WHERE 
        source_text = p_source_text
        AND source_language = p_source_language
        AND target_language = p_target_language;
END;
$$;

-- Create trigger for updating updated_at
CREATE TRIGGER update_translation_cache_updated_at
    BEFORE UPDATE ON translation_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 