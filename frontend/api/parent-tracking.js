// API endpoint for parent tracking and progress
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
      // Record interaction/activity
      const { firebase_uid, interactions_count, questions_asked, advice_followed, improvement_notes } = req.body;
      
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
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      const parent_id = userResult.rows[0].parent_id;

      // Check if tracking entry exists for today
      const today = new Date().toISOString().split('T')[0];
      const existing = await query(
        'SELECT id FROM parent_tracking WHERE parent_id = $1 AND date = $2',
        [parent_id, today]
      );

      let result;
      if (existing.rows.length > 0) {
        // Update existing
        result = await query(
          `UPDATE parent_tracking 
           SET interactions_count = interactions_count + COALESCE($1, 0),
               questions_asked = questions_asked + COALESCE($2, 0),
               advice_followed = advice_followed + COALESCE($3, 0),
               improvement_notes = COALESCE($4, improvement_notes)
           WHERE parent_id = $5 AND date = $6
           RETURNING *`,
          [interactions_count || 0, questions_asked || 0, advice_followed || 0, improvement_notes || null, parent_id, today]
        );
      } else {
        // Create new
        result = await query(
          `INSERT INTO parent_tracking (parent_id, interactions_count, questions_asked, advice_followed, improvement_notes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [parent_id, interactions_count || 0, questions_asked || 0, advice_followed || 0, improvement_notes || null]
        );
      }

      // Update parent's parenting score based on activity
      await query(
        `UPDATE parents 
         SET parenting_score = LEAST(100, parenting_score + 
           CASE 
             WHEN $1 > 0 THEN 1
             WHEN $2 > 0 THEN 2
             WHEN $3 > 0 THEN 3
             ELSE 0
           END),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [interactions_count || 0, questions_asked || 0, advice_followed || 0, parent_id]
      );

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      const { firebase_uid, days } = req.query;
      
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
        return res.status(404).json({ error: 'Parent profile not found' });
      }
      const parent_id = userResult.rows[0].parent_id;

      const daysLimit = parseInt(days) || 30;
      const result = await query(
        `SELECT * FROM parent_tracking 
         WHERE parent_id = $1 
         AND date >= CURRENT_DATE - INTERVAL '${daysLimit} days'
         ORDER BY date DESC`,
        [parent_id]
      );

      // Get parent profile with score
      const parentResult = await query(
        'SELECT parenting_score, improvement_areas, strengths FROM parents WHERE id = $1',
        [parent_id]
      );

      return res.status(200).json({
        tracking: result.rows,
        parent_stats: parentResult.rows[0] || {}
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in parent tracking API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};



