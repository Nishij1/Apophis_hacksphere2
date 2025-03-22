# Medical Translator

A powerful medical translation application that leverages AI to provide accurate medical terminology translations. Built with React, TypeScript, and modern AI services.

## Features

- 🤖 Dual AI Translation Engines
  - DeepSeek AI integration
  - ChatGPT fallback
  - Automatic service switching
  - Medical terminology optimization

- 🚀 Performance Optimizations
  - Two-level caching system (Memory + Database)
  - Rate limiting protection
  - Automatic cache management
  - LRU (Least Recently Used) cache eviction

- 🔒 Security & Reliability
  - Row Level Security (RLS)
  - Rate limiting per user
  - Error tracking and logging
  - Secure API key management

- 💾 Data Management
  - Persistent translation cache
  - Usage statistics tracking
  - Error logging system
  - Database migrations support

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Backend**: Supabase
- **AI Services**: DeepSeek AI, ChatGPT
- **Build Tool**: Vite
- **3D Graphics**: Three.js
- **Animations**: Framer Motion

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- DeepSeek AI API key
- OpenAI API key

## Environment Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd medical-translator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Run Supabase migrations:
```bash
# Navigate to the migrations directory
cd supabase/migrations

# Run migrations in order:
# 1. 20240321_add_translation_cache.sql
# 2. 20240321_add_rate_limit_function.sql
# 3. 20240321_add_translation_errors.sql
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Production Build

Build the application for production:
```bash
npm run build
# or
yarn build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Core services and utilities
│   ├── aiTranslation.ts    # AI translation service
│   ├── rateLimiter.ts     # Rate limiting service
│   └── translationCache.ts # Caching service
├── store/         # State management
└── App.tsx        # Main application component
```

## API Usage

```typescript
import { AITranslationService } from './lib/aiTranslation';

const translationService = AITranslationService.getInstance();

try {
  const result = await translationService.translate({
    text: "Your medical text here",
    sourceLanguage: "English",
    targetLanguage: "Spanish"
  });
  
  console.log(`Translated text: ${result.translatedText}`);
  console.log(`Translation source: ${result.source}`);
} catch (error) {
  console.error('Translation failed:', error);
}
```

## Rate Limits

- DeepSeek: 100 translations per hour
- ChatGPT: 50 translations per hour
- Automatic fallback between services
- Per-user rate limiting

## Caching System

- Memory cache: 1000 entries
- Database cache: Unlimited
- Automatic cache invalidation
- Usage-based cache management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- DeepSeek AI for their translation API
- OpenAI for ChatGPT integration
- Supabase for backend services
- All contributors and maintainers 