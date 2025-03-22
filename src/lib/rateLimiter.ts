import { supabase, isSupabaseConfigured } from './supabase/client';

export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 30; // 30 requests per minute

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getRateLimit(userId: string): { count: number; timestamp: number } {
    const now = Date.now();
    const limit = this.limits.get(userId);

    if (!limit || now - limit.timestamp > this.WINDOW_MS) {
      return { count: 0, timestamp: now };
    }

    return limit;
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const limit = this.getRateLimit(userId);
    const now = Date.now();

    if (now - limit.timestamp > this.WINDOW_MS) {
      this.limits.set(userId, { count: 1, timestamp: now });
      return true;
    }

    if (limit.count >= this.MAX_REQUESTS) {
      return false;
    }

    this.limits.set(userId, { count: limit.count + 1, timestamp: limit.timestamp });
    return true;
  }

  async getRemainingRequests(userId: string): Promise<number> {
    const limit = this.getRateLimit(userId);
    return Math.max(0, this.MAX_REQUESTS - limit.count);
  }

  async resetRateLimit(userId: string): Promise<void> {
    this.limits.delete(userId);
  }
} 