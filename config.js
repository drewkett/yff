// Configuration for Yahoo Fantasy API
const config = {
  // Replace with your Yahoo App Client ID
  // Get one at: https://developer.yahoo.com/apps/
  clientId: 'YOUR_YAHOO_CLIENT_ID',

  // OAuth endpoints
  authEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
  tokenEndpoint: 'https://api.login.yahoo.com/oauth2/get_token',

  // API endpoint
  apiEndpoint: 'https://fantasysports.yahooapis.com/fantasy/v2',

  // Redirect URI - update this to match your GitHub Pages URL
  // For local development: 'http://localhost:8000'
  // For production: 'https://yourusername.github.io/yff/'
  redirectUri: window.location.origin + window.location.pathname,

  // Scopes needed
  scope: 'openid'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
