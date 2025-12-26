// Database initialization script - run this once to create tables
const { query } = require('./db');

async function initDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create parents table
    await query(`
      CREATE TABLE IF NOT EXISTS parents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        location VARCHAR(255),
        parenting_style VARCHAR(255),
        concerns TEXT,
        goals TEXT,
        experience_level VARCHAR(255),
        family_structure VARCHAR(255),
        parenting_score INTEGER DEFAULT 0,
        improvement_areas TEXT[],
        strengths TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create children table
    await query(`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(50),
        hobbies TEXT[],
        interests TEXT[],
        personality_traits TEXT[],
        special_needs TEXT,
        school_grade VARCHAR(100),
        studies TEXT[],
        ethnicity VARCHAR(100),
        height_cm INTEGER,
        weight_kg NUMERIC(5,2),
        favorite_activities TEXT[],
        challenges TEXT,
        achievements TEXT,
        personality_assessment_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create personality_assessments table
    await query(`
      CREATE TABLE IF NOT EXISTS personality_assessments (
        id SERIAL PRIMARY KEY,
        child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
        image_url TEXT,
        quiz_data JSONB,
        ai_analysis JSONB,
        traits TEXT[],
        recommendations TEXT[],
        confidence_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create parent_tracking table for tracking parenting progress
    await query(`
      CREATE TABLE IF NOT EXISTS parent_tracking (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        interactions_count INTEGER DEFAULT 0,
        questions_asked INTEGER DEFAULT 0,
        advice_followed INTEGER DEFAULT 0,
        improvement_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_history table for storing chat messages
    await query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
        child_id INTEGER REFERENCES children(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        child_context TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to users table (for subscription and phone)
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
          ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_tier') THEN
          ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
        END IF;
      END $$;
    `);

    // Add new columns to parents table (for partner info, language, photo)
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='preferred_language') THEN
          ALTER TABLE parents ADD COLUMN preferred_language VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='photo_url') THEN
          ALTER TABLE parents ADD COLUMN photo_url TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='partner_first_name') THEN
          ALTER TABLE parents ADD COLUMN partner_first_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='partner_last_name') THEN
          ALTER TABLE parents ADD COLUMN partner_last_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='partner_email') THEN
          ALTER TABLE parents ADD COLUMN partner_email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='partner_phone') THEN
          ALTER TABLE parents ADD COLUMN partner_phone VARCHAR(20);
        END IF;
      END $$;
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_personality_assessments_child_id ON personality_assessments(child_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_parent_tracking_parent_id ON parent_tracking(parent_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_history_parent_id ON chat_history(parent_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_history_child_id ON chat_history(child_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { initDatabase };



