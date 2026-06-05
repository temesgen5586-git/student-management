import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // First, connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log('✅ Database ensured');

    // Read the SQL setup file
    const sqlFilePath = path.join(process.cwd(), 'src', 'config', 'setupDatabase.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into CREATE TABLE statements and INSERT statements
    const lines = sql.split('\n');
    const createStatements = [];
    const insertStatements = [];
    let currentStatement = '';
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('--') || !line.trim()) {
        continue;
      }
      currentStatement += line + '\n';
      if (line.includes(';')) {
        const stmt = currentStatement.trim();
        if (stmt.startsWith('CREATE TABLE')) {
          createStatements.push(stmt);
        } else if (stmt.startsWith('INSERT INTO')) {
          insertStatements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // First, execute all CREATE TABLE statements
    console.log('🔧 Creating tables...');
    for (const statement of createStatements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore "Table already exists" errors
        if (!err.message.includes('already exists')) {
          console.log(`⚠️ Table creation warning: ${err.message}`);
        }
      }
    }

    // Then execute all INSERT statements

    for (const statement of insertStatements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore duplicate key errors
        if (!err.message.includes('Duplicate entry')) {
          console.log(`⚠️ Insert warning: ${err.message}`);
        }
      }
    }
    console.log('✅ Sample data inserted');

    console.log('✅ Database tables initialized successfully');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

export default pool;
