// API endpoint for user management
const { query } = require('./db');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For GET requests, allow querying by firebase_uid from query string
    // For POST and other methods, require Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else if (req.method !== 'GET') {
      // Require auth for POST, PUT, DELETE, etc.
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      // Create user
      const { firebase_uid, email, username, first_name, last_name } = req.body;
      
      if (!firebase_uid || !email) {
        return res.status(400).json({ error: 'firebase_uid and email are required' });
      }

      const result = await query(
        `INSERT INTO users (firebase_uid, email, username, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (firebase_uid) 
         DO UPDATE SET email = EXCLUDED.email, username = EXCLUDED.username, 
                       first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
                       updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [firebase_uid, email, username || null, first_name || null, last_name || null]
      );

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      const { firebase_uid } = req.query;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebase_uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};



