const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const providers = ['red', 'blue', 'green'];
const keys = {};
const jwks = {};
const authCodes = {};

// Load keys and generate JWKS
providers.forEach(provider => {
  const privateKey = fs.readFileSync(path.join(__dirname, `${provider}.private.key`), 'utf8');
  const publicKey = fs.readFileSync(path.join(__dirname, `${provider}.public.key`), 'utf8');
  
  keys[provider] = {
    private: privateKey,
    public: publicKey,
  };

  // Convert PEM to JWK
  const publicKeyObj = crypto.createPublicKey(publicKey);
  const jwk = publicKeyObj.export({ format: 'jwk' });
  jwk.kid = `${provider}-key-1`;
  jwk.use = 'sig';
  jwk.alg = 'RS256';

  jwks[provider] = {
    keys: [jwk]
  };
});

// Home route
app.get('/', (req, res) => {
  res.send('<h2>Work Auth Mock Server</h2><p>Available providers: /red, /blue, /green</p>');
});

const loginTemplate = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
const PORT = process.env.PORT || 4000;
const BASE_URL = `https://localhost:${PORT}`;

// Setup routes for each provider
providers.forEach(provider => {
  const issuer = `${BASE_URL}/${provider}`;

  // 1. OIDC Discovery Endpoint
  app.get(`/${provider}/.well-known/openid-configuration`, (req, res) => {
    res.json({
      issuer: issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      userinfo_endpoint: `${issuer}/userinfo`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      response_types_supported: ["code", "id_token", "token id_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "profile", "email", "offline_access"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"],
      claims_supported: ["sub", "iss", "aud", "exp", "iat", "provider", "nonce", "roles"],
      grant_types_supported: ["authorization_code", "refresh_token"]
    });
  });

  // 2. JWKS Endpoint
  app.get(`/${provider}/.well-known/jwks.json`, (req, res) => {
    res.json(jwks[provider]);
  });

  // Expose raw public key for older clients
  app.get(`/${provider}/public-key`, (req, res) => {
    res.type('text/plain');
    res.send(keys[provider].public);
  });

  // 3. Authorization Endpoint
  app.get(`/${provider}/authorize`, (req, res) => {
    const redirectUri = req.query.redirect_uri || '';
    const state = req.query.state || '';
    const nonce = req.query.nonce || '';
    const color = provider === 'red' ? '#ffcccc' : provider === 'blue' ? '#ccccff' : '#ccffcc';
    
    const html = loginTemplate
      .replace(/{{PROVIDER_NAME}}/g, provider.toUpperCase())
      .replace(/{{PROVIDER}}/g, provider)
      .replace(/{{COLOR}}/g, color)
      .replace(/{{REDIRECT_URI}}/g, redirectUri)
      .replace(/{{STATE}}/g, state)
      .replace(/{{NONCE}}/g, nonce);
      
    res.send(html);
  });

  // Keep older login GET endpoint matching authorize
  app.get(`/${provider}/login`, (req, res) => {
    const params = new URLSearchParams(req.query).toString();
    res.redirect(`/${provider}/authorize?${params}`);
  });

  // 4. Login Form Handler
  app.post(`/${provider}/login`, (req, res) => {
    const { username, redirect_uri, state, nonce } = req.body;
    if (!username) {
      return res.status(400).send('Username is required');
    }

    if (redirect_uri) {
      // Authorization Code Flow
      const code = crypto.randomBytes(16).toString('hex');
      authCodes[code] = { username, nonce, provider };

      const url = new URL(redirect_uri);
      url.searchParams.append('code', code);
      if (state) url.searchParams.append('state', state);
      
      res.redirect(url.toString());
    } else {
      // Direct token return (implicit/legacy)
      const token = jwt.sign(
        { sub: username, provider: provider, nonce: nonce },
        keys[provider].private,
        { algorithm: 'RS256', expiresIn: '1h', issuer: issuer, keyid: `${provider}-key-1` }
      );
      res.json({ token, provider });
    }
  });

  // 5. Token Endpoint
  app.post(`/${provider}/token`, (req, res) => {
    const { grant_type, code, client_id, refresh_token } = req.body;

    if (grant_type === 'authorization_code') {
      const session = authCodes[code];
      if (!session) {
        console.log(`[Token] Error: code ${code} not found in authCodes`);
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Code not found' });
      }
      if (session.provider !== provider) {
        console.log(`[Token] Error: provider mismatch. Expected ${provider}, got ${session.provider}`);
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Provider mismatch' });
      }

      const idToken = jwt.sign(
        { sub: session.username, provider: provider, nonce: session.nonce, roles: ["my-guy"]  },
        keys[provider].private,
        { algorithm: 'RS256', expiresIn: '1h', issuer: issuer, audience: client_id || 'work-app', keyid: `${provider}-key-1` }
      );

      const accessToken = jwt.sign(
        { sub: session.username, provider: provider, roles: ["my-guy"] },
        keys[provider].private,
        { algorithm: 'RS256', expiresIn: '1h', issuer: issuer, audience: 'work-api', keyid: `${provider}-key-1` }
      );
      
      const refreshToken = jwt.sign(
        { sub: session.username, provider: provider },
        keys[provider].private,
        { algorithm: 'RS256', expiresIn: '30d', issuer: issuer, audience: 'work-api', keyid: `${provider}-key-1` }
      );

      delete authCodes[code];

      res.json({
        access_token: accessToken,
        id_token: idToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600
      });
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'Missing refresh_token' });
      }
      
      try {
        const decoded = jwt.verify(refresh_token, keys[provider].public, { algorithms: ['RS256'] });
        
        const idToken = jwt.sign(
          { sub: decoded.sub, provider: provider },
          keys[provider].private,
          { algorithm: 'RS256', expiresIn: '1h', issuer: issuer, audience: client_id || 'work-app', keyid: `${provider}-key-1` }
        );

        const accessToken = jwt.sign(
          { sub: decoded.sub, provider: provider },
          keys[provider].private,
          { algorithm: 'RS256', expiresIn: '1h', issuer: issuer, audience: 'work-api', keyid: `${provider}-key-1` }
        );

        res.json({
          access_token: accessToken,
          id_token: idToken,
          refresh_token: refresh_token,
          token_type: "Bearer",
          expires_in: 3600
        });
      } catch (err) {
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid refresh_token' });
      }
    } else {
      res.status(400).json({ error: 'unsupported_grant_type' });
    }
  });

  // 6. Userinfo Endpoint
  app.get(`/${provider}/userinfo`, (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, keys[provider].public, { algorithms: ['RS256'] });
      res.json({
        sub: decoded.sub,
        name: decoded.sub,
        provider: provider,
        roles: ["my-guy"]
      });
    } catch (err) {
      res.status(401).json({ error: 'invalid_token' });
    }
  });
});

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Mock Auth Server running on ${BASE_URL}`);
  console.log('Available OIDC Providers:');
  providers.forEach(p => console.log(` - ${BASE_URL}/${p}/.well-known/openid-configuration`));
});
