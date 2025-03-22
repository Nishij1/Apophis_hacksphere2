import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'medical_translator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Create tables and indexes if they don't exist
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create translation_cache table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_cache (
        id SERIAL PRIMARY KEY,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        source_language VARCHAR(10) NOT NULL,
        target_language VARCHAR(10) NOT NULL,
        medical_terms TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for medical_terms if it doesn't exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_translation_cache_medical_terms 
      ON translation_cache USING GIN (medical_terms);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export { pool, initializeDatabase }; 