// Database connection utility for Neon DB
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

async function query(text, params) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:24',message:'Query function called',data:{hasPool:!!pool,hasDatabaseUrl:!!(process.env.DATABASE_URL||process.env.POSTGRES_URL)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const pool = getPool();
  const start = Date.now();
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:29',message:'Before pool.query',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:32',message:'Query successful',data:{duration,rowCount:res.rowCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:35',message:'Database query error',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Database query error', { text, error: error.message });
    throw error;
  }
}

module.exports = { query, getPool };



