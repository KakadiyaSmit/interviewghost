const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.hnlohbxdgnuqsaxmofbh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    release();
  }
});

module.exports = pool;
