// API endpoint for children management
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
      // Create child
      const { firebase_uid, name, age, gender, hobbies, interests, personality_traits, 
              special_needs, school_grade, studies, ethnicity, height_cm, weight_kg,
              favorite_activities, challenges, achievements } = req.body;
      
      if (!firebase_uid || !name || !age || !gender) {
        return res.status(400).json({ error: 'firebase_uid, name, age, and gender are required' });
      }

      // Get parent_id from firebase_uid
      const userResult = await query(
        `SELECT p.id as parent_id 
         FROM users u 
         JOIN parents p ON p.user_id = u.id 
         WHERE u.firebase_uid = $1`,
        [firebase_uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent profile not found. Please create parent profile first.' });
      }
      const parent_id = userResult.rows[0].parent_id;

      const result = await query(
        `INSERT INTO children (parent_id, name, age, gender, hobbies, interests, personality_traits,
                              special_needs, school_grade, studies, ethnicity, height_cm, weight_kg,
                              favorite_activities, challenges, achievements)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [parent_id, name, age, gender, hobbies || [], interests || [], personality_traits || [],
         special_needs || null, school_grade || null, studies || [], ethnicity || null,
         height_cm || null, weight_kg || null, favorite_activities || [], challenges || null, achievements || null]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      const { firebase_uid, child_id } = req.query;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      // Get parent_id from firebase_uid
      const userResult = await query(
        `SELECT p.id as parent_id 
         FROM users u 
         JOIN parents p ON p.user_id = u.id 
         WHERE u.firebase_uid = $1`,
        [firebase_uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(200).json([]); // Return empty array if no parent profile
      }
      const parent_id = userResult.rows[0].parent_id;

      let result;
      if (child_id) {
        // Get specific child
        result = await query(
          'SELECT * FROM children WHERE id = $1 AND parent_id = $2',
          [child_id, parent_id]
        );
      } else {
        // Get all children for parent
        result = await query(
          'SELECT * FROM children WHERE parent_id = $1 ORDER BY created_at DESC',
          [parent_id]
        );
      }

      return res.status(200).json(child_id ? (result.rows[0] || null) : result.rows);
    }

    if (req.method === 'PUT') {
      // Update child
      const { child_id, firebase_uid, name, age, gender, hobbies, interests, personality_traits,
              special_needs, school_grade, studies, ethnicity, height_cm, weight_kg,
              favorite_activities, challenges, achievements } = req.body;
      
      if (!child_id || !firebase_uid) {
        return res.status(400).json({ error: 'child_id and firebase_uid are required' });
      }

      // Verify parent owns this child
      const userResult = await query(
        `SELECT p.id as parent_id 
         FROM users u 
         JOIN parents p ON p.user_id = u.id 
         WHERE u.firebase_uid = $1`,
        [firebase_uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      const parent_id = userResult.rows[0].parent_id;

      const result = await query(
        `UPDATE children 
         SET name = $1, age = $2, gender = $3, hobbies = $4, interests = $5, 
             personality_traits = $6, special_needs = $7, school_grade = $8, studies = $9,
             ethnicity = $10, height_cm = $11, weight_kg = $12, favorite_activities = $13,
             challenges = $14, achievements = $15, updated_at = CURRENT_TIMESTAMP
         WHERE id = $16 AND parent_id = $17
         RETURNING *`,
        [name, age, gender, hobbies || [], interests || [], personality_traits || [],
         special_needs || null, school_grade || null, studies || [], ethnicity || null,
         height_cm || null, weight_kg || null, favorite_activities || [], challenges || null,
         achievements || null, child_id, parent_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found or access denied' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { child_id, firebase_uid } = req.body;
      
      if (!child_id || !firebase_uid) {
        return res.status(400).json({ error: 'child_id and firebase_uid are required' });
      }

      // Verify parent owns this child
      const userResult = await query(
        `SELECT p.id as parent_id 
         FROM users u 
         JOIN parents p ON p.user_id = u.id 
         WHERE u.firebase_uid = $1`,
        [firebase_uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      const parent_id = userResult.rows[0].parent_id;

      const result = await query(
        'DELETE FROM children WHERE id = $1 AND parent_id = $2 RETURNING *',
        [child_id, parent_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found or access denied' });
      }

      return res.status(200).json({ message: 'Child deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in children API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};


