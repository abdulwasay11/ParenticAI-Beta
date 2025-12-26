// Dashboard stats endpoint
const { query } = require('../db');

module.exports = async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firebase_uid } = request.query;

    if (!firebase_uid) {
      return response.status(400).json({ error: 'firebase_uid is required' });
    }

    // Get user_id from firebase_uid
    const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
    if (userResult.rows.length === 0) {
      return response.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get parent_id
    const parentResult = await query('SELECT id FROM parents WHERE user_id = $1', [userId]);
    if (parentResult.rows.length === 0) {
      // Return zeros if no parent profile exists yet
      return response.json({
        childrenCount: 0,
        chatCount: 0,
        assessmentsCount: 0,
        daysActive: 1
      });
    }

    const parentId = parentResult.rows[0].id;

    // Get children count
    const childrenResult = await query('SELECT COUNT(*) as count FROM children WHERE parent_id = $1', [parentId]);
    const childrenCount = parseInt(childrenResult.rows[0].count) || 0;

    // Get chat count
    const chatResult = await query('SELECT COUNT(*) as count FROM chat_history WHERE parent_id = $1', [parentId]);
    const chatCount = parseInt(chatResult.rows[0].count) || 0;

    // Get assessments count (personality assessments)
    const assessmentsResult = await query(
      `SELECT COUNT(DISTINCT pa.id) as count 
       FROM personality_assessments pa
       INNER JOIN children c ON pa.child_id = c.id
       WHERE c.parent_id = $1`,
      [parentId]
    );
    const assessmentsCount = parseInt(assessmentsResult.rows[0].count) || 0;

    // Get days active (count distinct dates from chat_history or parent_tracking)
    const daysActiveResult = await query(
      `SELECT COUNT(DISTINCT DATE(created_at)) as count 
       FROM chat_history 
       WHERE parent_id = $1`,
      [parentId]
    );
    const chatDays = parseInt(daysActiveResult.rows[0]?.count || 0);
    
    const trackingResult = await query(
      `SELECT COUNT(DISTINCT date) as count 
       FROM parent_tracking 
       WHERE parent_id = $1`,
      [parentId]
    );
    const trackingDays = parseInt(trackingResult.rows[0]?.count || 0);
    
    // Get the maximum days active from both sources, minimum 1
    const daysActive = Math.max(chatDays, trackingDays, 1);

    response.json({
      childrenCount,
      chatCount,
      assessmentsCount,
      daysActive
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    response.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

