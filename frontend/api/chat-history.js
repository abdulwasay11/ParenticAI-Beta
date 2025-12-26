// Chat history endpoint
const { query } = require('./db');

module.exports = async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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
    const { firebase_uid, child_id, limit = 50 } = request.query;

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
      return response.json([]);
    }

    const parentId = parentResult.rows[0].id;

    // Build query - filter by child_id if provided
    let historyQuery;
    let queryParams;
    
    if (child_id) {
      historyQuery = `
        SELECT id, message, response, child_id, created_at
        FROM chat_history
        WHERE parent_id = $1 AND child_id = $2
        ORDER BY created_at DESC
        LIMIT $3
      `;
      queryParams = [parentId, parseInt(child_id), parseInt(limit)];
    } else {
      historyQuery = `
        SELECT id, message, response, child_id, created_at
        FROM chat_history
        WHERE parent_id = $1 AND child_id IS NULL
        ORDER BY created_at DESC
        LIMIT $2
      `;
      queryParams = [parentId, parseInt(limit)];
    }

    const historyResult = await query(historyQuery, queryParams);
    
    // Reverse to get chronological order (oldest first)
    const history = historyResult.rows.reverse().map(row => ({
      id: row.id,
      message: row.message,
      response: row.response,
      child_id: row.child_id,
      timestamp: row.created_at
    }));

    response.json(history);
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (error.code === '42P01') {
      console.log('[chat-history.js] chat_history table does not exist yet, returning empty array');
      return response.json([]);
    }
    console.error('Error getting chat history:', error);
    response.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

