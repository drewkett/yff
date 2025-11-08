/**
 * Main application logic
 */

const App = {
  // Initialize the application
  async init() {
    // Initialize UI
    UI.init();

    try {
      // Check if we're handling an OAuth callback
      const isCallback = await YahooAuth.handleCallback();

      if (isCallback) {
        // Successfully authenticated, load leagues
        await this.loadLeagues();
        return;
      }

      // Check if user is already authenticated
      if (YahooAuth.isAuthenticated()) {
        await this.loadLeagues();
      } else {
        UI.showView('login');
      }

      UI.updateUserInfo(YahooAuth.isAuthenticated());
    } catch (error) {
      console.error('Initialization error:', error);
      UI.showError(error.message || 'Failed to initialize application');
    }
  },

  // Load user's leagues
  async loadLeagues() {
    try {
      UI.showView('loading');

      const leagues = await YahooAPI.getAllLeagues();

      UI.renderLeagues(leagues);
      UI.showView('leagues');
      UI.updateUserInfo(true);
    } catch (error) {
      console.error('Error loading leagues:', error);
      UI.showError('Failed to load leagues. Please try again.');
    }
  },

  // Load league details
  async loadLeagueDetails(leagueKey) {
    try {
      UI.showView('loading');

      const standings = await YahooAPI.getLeagueStandings(leagueKey);

      UI.renderLeagueDetails(standings);
      UI.showView('leagueDetails');
    } catch (error) {
      console.error('Error loading league details:', error);
      UI.showError('Failed to load league details. Please try again.');
    }
  }
};

// Make App globally accessible
window.App = App;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
