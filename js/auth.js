/**
 * OAuth 2.0 Authentication with PKCE for Yahoo
 * This module handles the OAuth flow without requiring a backend server
 */

const YahooAuth = {
  // Generate a random string for PKCE
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    randomValues.forEach(v => {
      result += chars[v % chars.length];
    });
    return result;
  },

  // Generate SHA256 hash
  async sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
  },

  // Base64 URL encode
  base64urlencode(buffer) {
    let str = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach(byte => {
      str += String.fromCharCode(byte);
    });
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },

  // Generate PKCE challenge
  async generateChallenge(verifier) {
    const hashed = await this.sha256(verifier);
    return this.base64urlencode(hashed);
  },

  // Store auth state
  saveAuthState(state, verifier) {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('code_verifier', verifier);
  },

  // Retrieve auth state
  getAuthState() {
    return {
      state: sessionStorage.getItem('oauth_state'),
      verifier: sessionStorage.getItem('code_verifier')
    };
  },

  // Clear auth state
  clearAuthState() {
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('code_verifier');
  },

  // Store tokens
  saveTokens(accessToken, refreshToken, expiresIn) {
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('expires_at', expiresAt.toString());
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  // Get access token
  getAccessToken() {
    const token = localStorage.getItem('access_token');
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');

    if (!token || Date.now() >= expiresAt) {
      return null;
    }

    return token;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getAccessToken() !== null;
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    this.clearAuthState();
  },

  // Initiate OAuth flow
  async login() {
    try {
      // Generate PKCE parameters
      const state = this.generateRandomString(32);
      const codeVerifier = this.generateRandomString(128);
      const codeChallenge = await this.generateChallenge(codeVerifier);

      // Save state and verifier
      this.saveAuthState(state, codeVerifier);

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      const authUrl = `${config.authEndpoint}?${params.toString()}`;

      // Redirect to Yahoo login
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating login:', error);
      throw new Error('Failed to initiate login');
    }
  },

  // Handle OAuth callback
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      return false; // Not a callback
    }

    // Verify state
    const savedState = this.getAuthState();
    if (state !== savedState.state) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for token
    try {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code: code,
        code_verifier: savedState.verifier,
        grant_type: 'authorization_code'
      });

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const data = await response.json();

      // Save tokens
      this.saveTokens(data.access_token, data.refresh_token, data.expires_in);

      // Clear auth state
      this.clearAuthState();

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to complete authentication');
    }
  },

  // Refresh access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.saveTokens(data.access_token, data.refresh_token, data.expires_in);

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, logout
      this.logout();
      throw error;
    }
  }
};
