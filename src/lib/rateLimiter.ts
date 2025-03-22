import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rate limit configuration
const RATE_LIMITS = {
  deepseek: {
    tokensPerHour: 100,  // 100 translations per hour
    refillInterval: 3600000, // 1 hour in milliseconds
  },
  chatgpt: {
    tokensPerHour: 50,   // 50 translations per hour
    refillInterval: 3600000, // 1 hour in milliseconds
  }
};

export class RateLimiter {
  private static instance: RateLimiter;
  private user: User | null = null;

  private constructor() {
    this.initializeUser();
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private async getRateLimit(apiType: 'deepseek' | 'chatgpt'): Promise<number> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('api_type', apiType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rate limit record exists, create one
        await this.initializeRateLimit(apiType);
        return RATE_LIMITS[apiType].tokensPerHour;
      }
      throw error;
    }

    // Check if we need to refill tokens
    const now = new Date();
    const lastRefill = new Date(data.last_refill);
    const timeSinceLastRefill = now.getTime() - lastRefill.getTime();

    if (timeSinceLastRefill >= RATE_LIMITS[apiType].refillInterval) {
      // Refill tokens
      await this.refillTokens(apiType);
      return RATE_LIMITS[apiType].tokensPerHour;
    }

    return data.tokens_remaining;
  }

  private async initializeRateLimit(apiType: 'deepseek' | 'chatgpt'): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('rate_limits')
      .insert({
        user_id: this.user.id,
        api_type: apiType,
        tokens_remaining: RATE_LIMITS[apiType].tokensPerHour,
        last_refill: new Date().toISOString()
      });

    if (error) {
      throw error;
    }
  }

  private async refillTokens(apiType: 'deepseek' | 'chatgpt'): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('rate_limits')
      .update({
        tokens_remaining: RATE_LIMITS[apiType].tokensPerHour,
        last_refill: new Date().toISOString()
      })
      .eq('user_id', this.user.id)
      .eq('api_type', apiType);

    if (error) {
      throw error;
    }
  }

  private async consumeToken(apiType: 'deepseek' | 'chatgpt'): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.rpc('consume_rate_limit_token', {
      p_user_id: this.user.id,
      p_api_type: apiType
    });

    if (error) {
      throw error;
    }
  }

  public async checkRateLimit(apiType: 'deepseek' | 'chatgpt'): Promise<boolean> {
    try {
      const tokensRemaining = await this.getRateLimit(apiType);
      return tokensRemaining > 0;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  public async consumeRateLimit(apiType: 'deepseek' | 'chatgpt'): Promise<void> {
    try {
      await this.consumeToken(apiType);
    } catch (error) {
      console.error('Failed to consume rate limit token:', error);
      throw error;
    }
  }
} 