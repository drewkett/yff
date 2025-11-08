# Setup Instructions

This guide will help you set up the Yahoo Fantasy Football Interface for your own use.

## Step 1: Fork/Clone the Repository

1. Fork this repository to your GitHub account
2. Clone it to your local machine (optional for development)

## Step 2: Create a Yahoo Developer App

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Sign in with your Yahoo account
3. Go to "My Apps" or visit https://developer.yahoo.com/apps/
4. Click "Create an App"

### App Configuration

Fill in the following details:

- **Application Name**: Yahoo Fantasy Football Interface (or your preferred name)
- **Application Type**: Web Application
- **Description**: Alternative web interface for Yahoo Fantasy Football
- **Home Page URL**: Your GitHub Pages URL (e.g., `https://yourusername.github.io/yff/`)
- **Redirect URI(s)**: Your GitHub Pages URL (e.g., `https://yourusername.github.io/yff/`)
  - For local development, also add: `http://localhost:8000`
- **API Permissions**: Select "Fantasy Sports" with "Read" access

5. Click "Create App"
6. Note your **Client ID** (you'll need this in the next step)

**Important**: Yahoo will show you a Client Secret, but you don't need it for this client-side application using PKCE.

## Step 3: Configure Your App

1. Open the `config.js` file in the repository
2. Replace `YOUR_YAHOO_CLIENT_ID` with your actual Client ID from Step 2

```javascript
const config = {
  clientId: 'dj0yJmk9...YourActualClientID...', // Replace this
  // ... rest of config
};
```

3. Verify the `redirectUri` is set correctly:
   - For production: It will automatically use your GitHub Pages URL
   - For local development: Update it to `http://localhost:8000`

## Step 4: Deploy to GitHub Pages

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Pages" in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. The workflow will automatically deploy when you push to the main branch

### Verify Deployment

1. Push your changes (with the updated `config.js`) to the main branch
2. Go to the "Actions" tab in your repository
3. Wait for the deployment workflow to complete
4. Visit your GitHub Pages URL: `https://yourusername.github.io/yff/`

## Step 5: Test the Application

1. Visit your deployed app
2. Click "Connect to Yahoo"
3. You'll be redirected to Yahoo to authorize the app
4. After authorization, you should see your fantasy football leagues

## Local Development (Optional)

To run the app locally for development:

1. Update `config.js` to use localhost:
```javascript
redirectUri: 'http://localhost:8000'
```

2. Start a local server:
```bash
npm run dev
# or
python3 -m http.server 8000
```

3. Visit http://localhost:8000

4. Make sure your Yahoo app has `http://localhost:8000` as a redirect URI

**Important**: Remember to change the `redirectUri` back to your production URL before deploying!

## Troubleshooting

### "Invalid redirect URI" error
- Make sure the redirect URI in your Yahoo app exactly matches your deployed URL
- Check for trailing slashes - they must match exactly

### "Invalid client ID" error
- Verify you copied the complete Client ID from Yahoo
- Make sure there are no extra spaces or characters

### "Authentication failed" error
- Clear your browser's localStorage and try again
- Check the browser console for detailed error messages

### Leagues not loading
- Ensure you have fantasy football leagues for the current season
- Check that your Yahoo app has "Fantasy Sports" API permissions enabled
- Look in the browser console for API error messages

## Security Notes

1. **Never commit your Client ID to a public repository** if you want to keep it private
   - Consider using GitHub Secrets for sensitive values
   - For a truly private setup, make your repository private

2. **Access tokens are stored in localStorage**
   - They expire after a set time
   - Clear your browser data to remove them
   - Only use this app on trusted devices

3. **HTTPS is important**
   - GitHub Pages provides HTTPS by default
   - Always use HTTPS in production

## Next Steps

Once your app is running:

1. Explore your leagues and standings
2. Consider adding custom features for your league (keeper tracking, custom scoring, etc.)
3. Customize the styling to match your preferences

## Getting Help

- Check the [README.md](README.md) for general information
- Review Yahoo's [Fantasy Sports API documentation](https://developer.yahoo.com/fantasysports/guide/)
- Open an issue on GitHub if you encounter problems
