const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('../work-db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const providers = ['red', 'blue', 'green'];
const publicKeys = {};

// Load public keys directly from work-auth
providers.forEach(provider => {
  publicKeys[provider] = fs.readFileSync(path.join(__dirname, `../work-auth/${provider}.public.key`), 'utf8');
});

// Example public endpoint
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public endpoint, anyone can see this.' });
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer <token>"

  if (!token) return res.sendStatus(401);

  // Decode without verifying to find out which provider issued the token
  const decodedPayload = jwt.decode(token);
  if (!decodedPayload || !decodedPayload.provider) {
    return res.sendStatus(403);
  }

  const provider = decodedPayload.provider;
  const publicKey = publicKeys[provider];

  if (!publicKey) {
    return res.sendStatus(403);
  }

  // Verify the token with the correct public key and check issuer/algorithm
  const expectedIssuer = `https://localhost:4000/${provider}`;
  jwt.verify(token, publicKey, { algorithms: ['RS256'], issuer: expectedIssuer }, (err, decoded) => {
    if (err) return res.sendStatus(403);
    
    // Assign decoded user info to req.user
    // work-auth uses 'sub' for the username
    req.user = { username: decoded.sub, provider: decoded.provider };
    next();
  });
};

// Example protected endpoint
app.get('/api/protected', authenticateToken, (req, res) => {
      // const { customerId } = req.params;
      //   const query = `
      //       SELECT o.OrderID, o.OrderDate, c.CompanyName, o.ShipCity 
      //       FROM Orders o
      //       JOIN Customers c ON o.CustomerID = c.CustomerID
      //       WHERE o.CustomerID = ?
      //   `;
      //   const statement = db.prepare(query);
      //   const results = statement.all(customerId);
      const tableQuery = `SELECT name FROM sqlite_master WHERE type='table';`
      const tableColumnQuery = `
        SELECT m.name AS table_name, p.name AS column_name, p.type AS data_type
        FROM sqlite_master AS m
        JOIN pragma_table_info(m.name) AS p
        WHERE m.type = 'table'
        ORDER BY m.name;
        `
      //GEMINI: help me out here with a suggestion for how to run a query with no parameters against my sqlite3 db const
      const statement = db.prepare(tableColumnQuery)
      const results = statement.all()
      const allTableData = results.map(r => r['table_name'])
      const uniqueTables = [... new Set(allTableData)]
      let simpleSchema = {}
      for(let t of uniqueTables){
        simpleSchema[t] = results.filter(r => r['table_name'] === t).map(r => { return {column: r['column_name'], type: r['data_type']}})
      }
      fs.writeFileSync('../work-db/northwind-simple-schema.json', JSON.stringify(simpleSchema, null, 2), 'utf8')
  res.json({ message: `Hello ${req.user.username}, this is a protected endpoint.`, data: simpleSchema});
});

const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});
