const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
  res.json({ message: `Hello ${req.user.username}, this is a protected endpoint.` });
});

const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});
