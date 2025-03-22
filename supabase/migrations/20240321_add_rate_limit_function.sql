-- Create function to consume rate limit tokens
CREATE OR REPLACE FUNCTION consume_rate_limit_token(
    p_user_id UUID,
    p_api_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE rate_limits
    SET tokens_remaining = GREATEST(tokens_remaining - 1, 0)
    WHERE user_id = p_user_id
    AND api_type = p_api_type;
END;
$$; 