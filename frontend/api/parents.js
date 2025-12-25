// API endpoint for parent profile management
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      // Create or update parent profile
      const { firebase_uid, age, location, parenting_style, concerns, goals, experience_level, family_structure } = req.body;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      // Get user_id from firebase_uid
      const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user_id = userResult.rows[0].id;

      // Check if parent profile exists
      const existingParent = await query('SELECT id FROM parents WHERE user_id = $1', [user_id]);

      let result;
      if (existingParent.rows.length > 0) {
        // Update existing
        result = await query(
          `UPDATE parents 
           SET age = $1, location = $2, parenting_style = $3, concerns = $4, 
               goals = $5, experience_level = $6, family_structure = $7,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $8
           RETURNING *`,
          [age || null, location || null, parenting_style || null, concerns || null,
           goals || null, experience_level || null, family_structure || null, user_id]
        );
      } else {
        // Create new
        result = await query(
          `INSERT INTO parents (user_id, age, location, parenting_style, concerns, goals, experience_level, family_structure)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [user_id, age || null, location || null, parenting_style || null, concerns || null,
           goals || null, experience_level || null, family_structure || null]
        );
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      const { firebase_uid } = req.query;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      // Get user_id from firebase_uid
      const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user_id = userResult.rows[0].id;

      const result = await query(
        `SELECT p.*, 
         (SELECT COUNT(*) FROM children WHERE parent_id = p.id) as children_count,
         (SELECT AVG(confidence_score) FROM personality_assessments pa 
          JOIN children c ON c.id = pa.child_id WHERE c.parent_id = p.id) as avg_assessment_score
         FROM parents p 
         WHERE p.user_id = $1`,
        [user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      // Update parent profile
      const { firebase_uid, age, location, parenting_style, concerns, goals, experience_level, family_structure } = req.body;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user_id = userResult.rows[0].id;

      const result = await query(
        `UPDATE parents 
         SET age = COALESCE($1, age), 
             location = COALESCE($2, location), 
             parenting_style = COALESCE($3, parenting_style),
             concerns = COALESCE($4, concerns),
             goals = COALESCE($5, goals),
             experience_level = COALESCE($6, experience_level),
             family_structure = COALESCE($7, family_structure),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $8
         RETURNING *`,
        [age, location, parenting_style, concerns, goals, experience_level, family_structure, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in parents API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};


