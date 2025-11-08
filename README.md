# Yahoo Fantasy Football Interface

An alternative web interface for Yahoo Fantasy Football, deployed as a static site on GitHub Pages.

## Features

- OAuth 2.0 authentication with Yahoo
- View your fantasy football leagues and teams
- Access league data and standings
- Future: Keeper tracking with custom rules for deadlines, values, and payouts

## Setup

### Prerequisites

1. **Yahoo Developer Account**: You'll need to create a Yahoo app to get OAuth credentials.
   - Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/)
   - Create a new app
   - Set the redirect URI to: `https://[your-username].github.io/yff/` (or your custom domain)
   - Note your Client ID

2. **GitHub Pages**: This app is designed to be deployed on GitHub Pages.

### Configuration

1. Clone this repository
2. Update the `config.js` file with your Yahoo Client ID
3. Deploy to GitHub Pages

### Yahoo API Setup

To use this app, you need to:

1. Register a Yahoo application at https://developer.yahoo.com/apps/
2. Use these settings:
   - Application Type: Web Application
   - Redirect URI: Your GitHub Pages URL (e.g., `https://yourusername.github.io/yff/`)
   - API Permissions: Fantasy Sports (read)

3. Copy your Client ID and update it in `config.js`

## Usage

1. Visit the deployed site
2. Click "Connect to Yahoo" to authenticate
3. Grant permissions for the app to access your fantasy data
4. View your leagues and teams

## Development

To run locally:

```bash
# Serve the files on localhost
npm run dev

# Visit http://localhost:8000
```

Note: OAuth redirects will only work with the configured redirect URI, so local development may require updating your Yahoo app settings.

## Security Notes

- This app uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication without a backend server
- Access tokens are stored in browser localStorage
- Never share your Yahoo Client ID in public repositories
- Consider using environment-specific configuration files

## Deployment

### GitHub Pages

1. Enable GitHub Pages in your repository settings
2. Set the source to the main branch
3. Your app will be available at `https://[username].github.io/[repo-name]/`

Or use the deploy script:

```bash
npm run deploy
```

## Future Features

- [ ] Keeper deadline tracking
- [ ] Keeper value calculations
- [ ] Payout calculations based on league rules
- [ ] Historical data analysis
- [ ] Custom scoring rules

## License

MIT
