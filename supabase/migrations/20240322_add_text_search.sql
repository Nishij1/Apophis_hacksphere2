-- Enable pg_trgm extension for trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index on content column
CREATE INDEX IF NOT EXISTS medical_reports_content_trgm_idx ON medical_reports USING GIN (content gin_trgm_ops);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_medical_reports(search_query text, similarity_threshold float DEFAULT 0.3)
RETURNS TABLE (
    id UUID,
    content text,
    source text,
    timestamp timestamptz,
    keywords text[],
    summary text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.content,
        r.source,
        r.timestamp,
        r.keywords,
        r.summary,
        GREATEST(
            similarity(r.content, search_query),
            similarity(r.summary, search_query),
            (SELECT COALESCE(MAX(similarity(k, search_query)), 0) FROM unnest(r.keywords) k)
        ) as similarity
    FROM medical_reports r
    WHERE 
        -- Use both trigram and full-text search for better results
        (r.content % search_query OR 
         r.fts_content @@ plainto_tsquery('english', search_query) OR
         r.summary % search_query OR
         EXISTS (SELECT 1 FROM unnest(r.keywords) k WHERE k % search_query))
        AND
        -- Ensure minimum similarity threshold
        GREATEST(
            similarity(r.content, search_query),
            similarity(r.summary, search_query),
            (SELECT COALESCE(MAX(similarity(k, search_query)), 0) FROM unnest(r.keywords) k)
        ) > similarity_threshold
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql;