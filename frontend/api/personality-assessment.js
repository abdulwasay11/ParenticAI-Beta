// API endpoint for personality assessment
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
      // Create personality assessment
      const { firebase_uid, child_id, image_url, quiz_data, ai_analysis, traits, recommendations, confidence_score } = req.body;
      
      if (!firebase_uid || !child_id) {
        return res.status(400).json({ error: 'firebase_uid and child_id are required' });
      }

      // Verify parent owns this child
      const userResult = await query(
        `SELECT c.id 
         FROM users u 
         JOIN parents p ON p.user_id = u.id 
         JOIN children c ON c.parent_id = p.id
         WHERE u.firebase_uid = $1 AND c.id = $2`,
        [firebase_uid, child_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found or access denied' });
      }

      // Store assessment
      const result = await query(
        `INSERT INTO personality_assessments (child_id, image_url, quiz_data, ai_analysis, traits, recommendations, confidence_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [child_id, image_url || null, quiz_data ? JSON.stringify(quiz_data) : null,
         ai_analysis ? JSON.stringify(ai_analysis) : null, traits || [], recommendations || [], confidence_score || 0]
      );

      // Update child's personality_assessment_data
      await query(
        `UPDATE children 
         SET personality_assessment_data = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify({ traits, recommendations, confidence_score, assessed_at: new Date().toISOString() }), child_id]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'GET') {
      const { firebase_uid, child_id, assessment_id } = req.query;
      
      if (!firebase_uid) {
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      if (assessment_id) {
        // Get specific assessment
        const result = await query(
          `SELECT pa.* 
           FROM personality_assessments pa
           JOIN children c ON c.id = pa.child_id
           JOIN parents p ON p.id = c.parent_id
           JOIN users u ON u.id = p.user_id
           WHERE u.firebase_uid = $1 AND pa.id = $2`,
          [firebase_uid, assessment_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Assessment not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else if (child_id) {
        // Get all assessments for a child
        const result = await query(
          `SELECT pa.* 
           FROM personality_assessments pa
           JOIN children c ON c.id = pa.child_id
           JOIN parents p ON p.id = c.parent_id
           JOIN users u ON u.id = p.user_id
           WHERE u.firebase_uid = $1 AND c.id = $2
           ORDER BY pa.created_at DESC`,
          [firebase_uid, child_id]
        );

        return res.status(200).json(result.rows);
      } else {
        // Get all assessments for user's children
        const result = await query(
          `SELECT pa.*, c.name as child_name
           FROM personality_assessments pa
           JOIN children c ON c.id = pa.child_id
           JOIN parents p ON p.id = c.parent_id
           JOIN users u ON u.id = p.user_id
           WHERE u.firebase_uid = $1
           ORDER BY pa.created_at DESC`,
          [firebase_uid]
        );

        return res.status(200).json(result.rows);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in personality assessment API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

