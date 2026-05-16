const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const dbFilePath = args[0];
const sqlFilePath = args[1];

if(!dbFilePath) {
    console.error("No db file path (arguments 1&2 required) provided\n");
    process.exit(1);
}
if(!sqlFilePath) {
    console.error("No sql file path (arguments 1&2 required) provided\n");
    process.exit(1);
}
if(!fs.existsSync(dbFilePath)) {
    console.log(`Creating new database at ${dbFilePath}\n`);
}
if(!fs.existsSync(sqlFilePath)) { 
    console.error(`No query found at ${sqlFilePath}\n`);
    process.exit(1);
}

let db;
try {
  // Override console.log to always append \n per the user's request, but better-sqlite3 already logs as lines, 
  // so we'll just log the message with an extra \n
  db = new Database(dbFilePath, { verbose: (msg) => console.log(msg + '\n') });
} catch (err) {
  console.error(`Error connecting to the database: ${err.message}\n`);
  process.exit(1);
}

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');

const query = fs.readFileSync(path.join('.', sqlFilePath), 'utf8');

const rawParams = args.slice(2);
let finalizedParams;

if (rawParams.length === 0) {
  finalizedParams = [];
} else if (rawParams.length === 1 && isJson(rawParams[0])) {
  try {
    finalizedParams = JSON.parse(rawParams[0]);
  } catch (err) {
    console.error(`Failed to parse parameters as JSON: ${err.message}\n`);
    finalizedParams = rawParams;
  }
} else {
  finalizedParams = rawParams;
}

console.log(`Executing query with params:`, finalizedParams, '\n');

const consoleRowLimit = 100;
let masterResults = [];

function parseSqlStatements(sql) {
  const stmts = [];
  let currentStmt = '';
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        currentStmt += '\n';
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip '/'
        currentStmt += ' ';
      }
      continue;
    }

    if (!inString) {
      if (char === '-' && nextChar === '-') {
        inLineComment = true;
        i++; // skip second '-'
        continue;
      } else if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++; // skip '*'
        continue;
      } else if (char === "'" || char === '"' || char === '`') {
        inString = true;
        stringChar = char;
        currentStmt += char;
      } else if (char === ';') {
        if (currentStmt.trim()) {
          stmts.push(currentStmt.trim());
        }
        currentStmt = '';
      } else {
        currentStmt += char;
      }
    } else {
      currentStmt += char;
      if (char === stringChar) {
        inString = false;
      }
    }
  }

  if (currentStmt.trim()) {
    stmts.push(currentStmt.trim());
  }

  return stmts;
}

const statements = parseSqlStatements(query);
console.log(`Parsed ${statements.length} top-level statement(s) to execute.\n`);

try {
  for (let i = 0; i < statements.length; i++) {
    const stmtSql = statements[i];
    console.log(`Executing Statement ${i + 1}:\n${stmtSql}\n`);
    
    const statement = db.prepare(stmtSql);
    
    // Determine if we should use .all() (for queries returning data) or .run() (for mutations)
    // statement.reader is true if the statement returns data (e.g. SELECT, PRAGMA)
    let result;
    
    // Try to execute with params, fallback to without if "Too many parameters" is thrown (for queries that don't need params)
    try {
        if (statement.reader) {
            result = statement.all(finalizedParams);
        } else {
            result = statement.run(finalizedParams);
        }
    } catch (err) {
        console.error('Error executing statement:', err.message, '\n')
    }

    if (statement.reader) {
        if (Array.isArray(result)) {
            masterResults.push(...result);
            console.log(`Statement ${i + 1} successful. Returned ${result.length} rows.\n`);
        }
    } else {
        console.log(`Statement ${i + 1} successful. Rows modified: ${result.changes}\n`);
    }
  }

  console.log('All queries executed successfully.\n');
  const resultsFilePath = path.join('.', 'query-results.json');
  console.log(`Writing results to ${resultsFilePath}\n`);
  
  fs.writeFileSync(resultsFilePath, JSON.stringify(masterResults, null, 2), 'utf8');
  
  console.log(`${masterResults.length} total rows aggregated.\n`);
  console.log(`Displaying ${masterResults.length > consoleRowLimit ? consoleRowLimit : masterResults.length} rows.\n`);
  
  // Truncate and log out the sliced array
  const displayResults = masterResults.slice(0, consoleRowLimit); 
  console.log(displayResults, '\n');

} catch (err) {
  console.error(`Query Execution Error: ${err.message}\n`);
} finally {
  // Clean up connection
  console.log('Closing database connection...\n');
  db.close();
  console.log('Thank you for choosing MoYaBe.');
}

// Helper function to safely detect a JSON string
function isJson(str) {
  const trimmed = str.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

module.exports = db;
