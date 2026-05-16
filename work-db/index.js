const Database = require('better-sqlite3');
const path = require('path');

// Path to the downloaded northwind.db file
const dbPath = path.resolve(__dirname, 'dbs', 'northwind.db');

// Initialize database with logging enabled for debugging
const db = new Database(dbPath, { verbose: console.log });

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');

module.exports = db;