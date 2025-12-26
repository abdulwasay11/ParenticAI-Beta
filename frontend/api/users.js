// API endpoint for user management
const { query } = require('./db');

module.exports = async function handler(req, res) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:4',message:'Handler called',data:{method:req.method,url:req.url,path:req.path,query:req.query,hasAuth:!!req.headers.authorization},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:17',message:'OPTIONS request handled',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:54',message:'GET request processing',data:{firebase_uid,hasFirebaseUid:!!firebase_uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (!firebase_uid) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:58',message:'Missing firebase_uid',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return res.status(400).json({ error: 'firebase_uid is required' });
      }

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:61',message:'Before database query',data:{firebase_uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebase_uid]
      );

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:68',message:'After database query',data:{rowCount:result.rows.length,hasRows:result.rows.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (result.rows.length === 0) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:70',message:'User not found in database',data:{firebase_uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return res.status(404).json({ error: 'User not found' });
      }

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:74',message:'User found, returning data',data:{userId:result.rows[0].id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.js:75',message:'Error caught',data:{errorMessage:error.message,errorStack:error.stack,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Error in users API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};



