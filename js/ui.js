/**
 * UI management and view rendering
 */

const UI = {
  // View elements
  views: {},
  containers: {},

  // Initialize UI
  init() {
    // Cache view elements
    this.views = {
      login: document.getElementById('login-view'),
      loading: document.getElementById('loading-view'),
      leagues: document.getElementById('leagues-view'),
      leagueDetails: document.getElementById('league-details-view'),
      error: document.getElementById('error-view')
    };

    // Cache container elements
    this.containers = {
      userInfo: document.getElementById('user-info'),
      leagues: document.getElementById('leagues-container'),
      leagueDetails: document.getElementById('league-details-container'),
      errorMessage: document.getElementById('error-message')
    };

    // Cache button elements
    this.buttons = {
      login: document.getElementById('login-btn'),
      logout: document.getElementById('logout-btn'),
      refresh: document.getElementById('refresh-btn'),
      retry: document.getElementById('retry-btn'),
      back: document.getElementById('back-btn')
    };

    // Set up event listeners
    this.setupEventListeners();
  },

  // Set up event listeners
  setupEventListeners() {
    if (this.buttons.login) {
      this.buttons.login.addEventListener('click', () => {
        YahooAuth.login();
      });
    }

    if (this.buttons.logout) {
      this.buttons.logout.addEventListener('click', () => {
        YahooAuth.logout();
        this.showView('login');
      });
    }

    if (this.buttons.refresh) {
      this.buttons.refresh.addEventListener('click', () => {
        window.App.loadLeagues();
      });
    }

    if (this.buttons.retry) {
      this.buttons.retry.addEventListener('click', () => {
        window.App.init();
      });
    }

    if (this.buttons.back) {
      this.buttons.back.addEventListener('click', () => {
        this.showView('leagues');
      });
    }
  },

  // Show a specific view
  showView(viewName) {
    Object.values(this.views).forEach(view => {
      view.classList.add('hidden');
    });

    if (this.views[viewName]) {
      this.views[viewName].classList.remove('hidden');
    }
  },

  // Show error
  showError(message) {
    this.containers.errorMessage.textContent = message;
    this.showView('error');
  },

  // Update user info in header
  updateUserInfo(isAuthenticated) {
    if (isAuthenticated) {
      this.containers.userInfo.innerHTML = '<span>Connected to Yahoo</span>';
    } else {
      this.containers.userInfo.innerHTML = '';
    }
  },

  // Render leagues list
  renderLeagues(leagues) {
    if (!leagues || leagues.length === 0) {
      this.containers.leagues.innerHTML = '<div class="card"><p>No leagues found for this season.</p></div>';
      return;
    }

    const leaguesHTML = leagues.map(league => `
      <div class="league-card" data-league-key="${league.league_key}">
        <h3>${this.escapeHtml(league.name)}</h3>
        <div class="league-info">
          <div><strong>Season:</strong> ${league.season}</div>
          <div><strong>Teams:</strong> ${league.num_teams}</div>
          <div><strong>Type:</strong> ${this.formatLeagueType(league.league_type)}</div>
          <div><strong>Scoring:</strong> ${this.formatScoringType(league.scoring_type)}</div>
          ${league.current_week ? `<div><strong>Week:</strong> ${league.current_week}</div>` : ''}
        </div>
      </div>
    `).join('');

    this.containers.leagues.innerHTML = leaguesHTML;

    // Add click listeners to league cards
    document.querySelectorAll('.league-card').forEach(card => {
      card.addEventListener('click', () => {
        const leagueKey = card.dataset.leagueKey;
        window.App.loadLeagueDetails(leagueKey);
      });
    });
  },

  // Render league details and standings
  renderLeagueDetails(data) {
    if (!data) {
      this.containers.leagueDetails.innerHTML = '<div class="card"><p>Failed to load league details.</p></div>';
      return;
    }

    const { league, teams } = data;

    // Sort teams by rank
    const sortedTeams = teams.sort((a, b) => {
      return (a.standings?.rank || 999) - (b.standings?.rank || 999);
    });

    const detailsHTML = `
      <div class="card">
        <h2>${this.escapeHtml(league.name)}</h2>
        <div class="league-info">
          <div><strong>Season:</strong> ${league.season}</div>
          <div><strong>Teams:</strong> ${league.num_teams}</div>
          <div><strong>Type:</strong> ${this.formatLeagueType(league.league_type)}</div>
          <div><strong>Scoring:</strong> ${this.formatScoringType(league.scoring_type)}</div>
          ${league.current_week ? `<div><strong>Current Week:</strong> ${league.current_week}</div>` : ''}
        </div>
      </div>

      <div class="card">
        <h3>Standings</h3>
        <table class="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Manager</th>
              <th>Points For</th>
              <th>Points Against</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTeams.map(team => `
              <tr>
                <td>${team.standings?.rank || '-'}</td>
                <td>${this.escapeHtml(team.name)}</td>
                <td>${this.getManagerName(team.managers)}</td>
                <td>${team.standings?.points_for || '-'}</td>
                <td>${team.standings?.points_against || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.containers.leagueDetails.innerHTML = detailsHTML;
  },

  // Helper: Format league type
  formatLeagueType(type) {
    const types = {
      'private': 'Private',
      'public': 'Public'
    };
    return types[type] || type;
  },

  // Helper: Format scoring type
  formatScoringType(type) {
    const types = {
      'head': 'Head-to-Head',
      'point': 'Points',
      'headpoint': 'Head-to-Head Points',
      'headone': 'Head-to-Head One Win',
      'headcat': 'Head-to-Head Categories'
    };
    return types[type] || type;
  },

  // Helper: Get manager name
  getManagerName(managers) {
    if (!managers || managers.length === 0) return 'N/A';
    const manager = managers[0]?.manager;
    return manager?.nickname || manager?.guid || 'N/A';
  },

  // Helper: Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
