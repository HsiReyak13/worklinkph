const path = require('path');
const fs = require('fs');

const DB_CLIENT = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

// Normalize SQL between SQLite and MySQL where practical
function normalizeSql(sql) {
  if (DB_CLIENT === 'mysql') {
    // Replace SQLite datetime('now') with MySQL NOW()
    return sql.replace(/datetime\('now'\)/g, 'NOW()');
  }
  return sql;
}

let db;
let dbHelpers;

if (DB_CLIENT === 'mysql') {
  const mysql = require('mysql2/promise');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worklinkph',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  db = pool; // expose the pool for advanced usage if needed

  dbHelpers = {
    run: async (sql, params = []) => {
      const [result] = await pool.execute(normalizeSql(sql), params);
      return { lastID: result.insertId || null, changes: result.affectedRows || 0 };
    },
    get: async (sql, params = []) => {
      const [rows] = await pool.execute(normalizeSql(sql), params);
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    },
    all: async (sql, params = []) => {
      const [rows] = await pool.execute(normalizeSql(sql), params);
      return Array.isArray(rows) ? rows : [];
    },
    close: async () => {
      await pool.end();
    }
  };

  console.log('Connected to MySQL database');
} else {
  // Default: SQLite
  const sqlite3 = require('sqlite3').verbose();

  const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/worklinkph.db');

  // Ensure database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  // Enable foreign keys
  sqliteDb.run('PRAGMA foreign_keys = ON');

  db = sqliteDb;

  dbHelpers = {
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      });
    },
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    },
    all: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    close: () => {
      return new Promise((resolve, reject) => {
        sqliteDb.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  };
}

module.exports = { db, dbHelpers, client: DB_CLIENT };

