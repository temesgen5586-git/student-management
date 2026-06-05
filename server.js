import app from './src/app.js';
import pool, { initializeDatabase } from './src/config/db.js';

const PORT = process.env.PORT || 5002;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database (create tables if they don't exist)
    await initializeDatabase();
    
    // Test connection and start server
    pool.getConnection()
      .then(conn => {
        console.log('✅ MySQL connected');
        conn.release();
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
      })
      .catch(err => {
        console.error('❌ DB connection error:', err);
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
