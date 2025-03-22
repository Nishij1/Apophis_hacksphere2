import { supabase, isSupabaseConfigured } from './supabase';
import { RateLimiter } from './rateLimiter';
import { TranslationCacheService } from './translationCache';

// API Configuration
const GOOGLE_TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';
const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface TranslationResponse {
  translatedText: string;
  source: string;
  medicalTerms?: Array<{ term: string; explanation: string }>;
}

export class AITranslationService {
  private static instance: AITranslationService;
  private rateLimiter: RateLimiter;

  private constructor() {
    this.rateLimiter = RateLimiter.getInstance();
  }

  public static getInstance(): AITranslationService {
    if (!AITranslationService.instance) {
      AITranslationService.instance = new AITranslationService();
    }
    return AITranslationService.instance;
  }

  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Validate request
      if (!request.text || !request.sourceLanguage || !request.targetLanguage) {
        throw new Error('Missing required translation parameters');
      }

      // Check cache first
      const cachedTranslation = await TranslationCacheService.get(
        request.text,
        request.sourceLanguage,
        request.targetLanguage
      );

      if (cachedTranslation) {
        console.log('Using cached translation');
        return {
          translatedText: cachedTranslation.translated_text,
          source: 'google',
          medicalTerms: cachedTranslation.medical_terms
        };
      }

      // Check rate limit
      const canProceed = await this.rateLimiter.checkRateLimit('anonymous');
      if (!canProceed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Make translation request through CORS proxy
      const params = new URLSearchParams({
        client: 'gtx',
        sl: request.sourceLanguage,
        tl: request.targetLanguage,
        dt: 't',
        q: request.text
      });

      const response = await fetch(`${CORS_PROXY_URL}${GOOGLE_TRANSLATE_API_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
        throw new Error('Invalid response format from translation API');
      }

      const translatedText = data[0][0][0];
      
      // Extract medical terms (simplified for demo)
      const medicalTerms = this.extractMedicalTerms(translatedText);

      // Cache the result
      await TranslationCacheService.set(
        request.text,
        translatedText,
        request.sourceLanguage,
        request.targetLanguage,
        medicalTerms
      );

      return {
        translatedText,
        source: 'google',
        medicalTerms
      };
    } catch (error) {
      console.error('Translation error:', error);
      await this.logTranslationError(request, error);
      throw new Error('Translation failed');
    }
  }

  private extractMedicalTerms(text: string): Array<{ term: string; explanation: string }> {
    // Simple medical term extraction (can be enhanced with more sophisticated logic)
    const medicalTerms: Array<{ term: string; explanation: string }> = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Basic medical term detection (can be expanded)
    const medicalKeywords = ['pain', 'fever', 'headache', 'cough', 'symptoms', 'treatment', 'diagnosis'];
    
    words.forEach(word => {
      if (medicalKeywords.includes(word)) {
        medicalTerms.push({
          term: word,
          explanation: `Medical term related to ${word}`
        });
      }
    });

    return medicalTerms;
  }

  private async logTranslationError(request: TranslationRequest, error: any): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('translation_errors').insert({
          source_text: request.text,
          source_language: request.sourceLanguage,
          target_language: request.targetLanguage,
          error_message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.error('Failed to log translation error:', logError);
    }
  }
}