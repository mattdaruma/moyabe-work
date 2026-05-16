const fs = require('fs');
const sqlite3 = require("sqlite3").verbose();
const { SqliteGuiNode } = require("sqlite-gui-node");

const defaultDbPath = "../work-db/dbs/northwind.db";

const args = process.argv.slice(2);
const dbPath = args[0];

if(!dbPath) {
  console.warn(`No database path provided.  Using ${defaultDbPath}\n`);
  dbPath = defaultDbPath;
}
if(!fs.existsSync(dbPath)) console.warn(`No database found at ${dbPath}. Creating new database file...\n`)
  
const db = new sqlite3.Database(dbPath);
SqliteGuiNode(db).catch((err) => {
  console.error("Error starting the GUI:", err);
});
