/**
 * Yahoo Fantasy Sports API client
 * Documentation: https://developer.yahoo.com/fantasysports/guide/
 */

const YahooAPI = {
  // Make an authenticated API request
  async request(endpoint, options = {}) {
    let token = YahooAuth.getAccessToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${config.apiEndpoint}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // If unauthorized, try to refresh token
      if (response.status === 401) {
        token = await YahooAuth.refreshToken();
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status}`);
        }

        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },

  // Get user's games (seasons)
  async getUserGames() {
    try {
      const data = await this.request('/users;use_login=1/games');
      return this.parseGamesResponse(data);
    } catch (error) {
      console.error('Error fetching user games:', error);
      throw error;
    }
  },

  // Get user's leagues for a specific game
  async getUserLeagues(gameKey = 'nfl') {
    try {
      const data = await this.request(`/users;use_login=1/games;game_keys=${gameKey}/leagues`);
      return this.parseLeaguesResponse(data);
    } catch (error) {
      console.error('Error fetching user leagues:', error);
      throw error;
    }
  },

  // Get all user's fantasy football leagues (current season)
  async getAllLeagues() {
    try {
      // Get current NFL game key (e.g., nfl for current season, 423 for 2024)
      // For now, we'll use 'nfl' which gets the current season
      const data = await this.request('/users;use_login=1/games;game_keys=nfl/leagues');
      return this.parseLeaguesResponse(data);
    } catch (error) {
      console.error('Error fetching all leagues:', error);
      throw error;
    }
  },

  // Get league details
  async getLeagueDetails(leagueKey) {
    try {
      const data = await this.request(`/league/${leagueKey}`);
      return this.parseLeagueResponse(data);
    } catch (error) {
      console.error('Error fetching league details:', error);
      throw error;
    }
  },

  // Get league standings
  async getLeagueStandings(leagueKey) {
    try {
      const data = await this.request(`/league/${leagueKey}/standings`);
      return this.parseStandingsResponse(data);
    } catch (error) {
      console.error('Error fetching league standings:', error);
      throw error;
    }
  },

  // Get user's teams
  async getUserTeams() {
    try {
      const data = await this.request('/users;use_login=1/games;game_keys=nfl/teams');
      return this.parseTeamsResponse(data);
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  },

  // Get team details
  async getTeamDetails(teamKey) {
    try {
      const data = await this.request(`/team/${teamKey}`);
      return this.parseTeamResponse(data);
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  },

  // Parse responses (Yahoo API returns complex nested structures)
  parseGamesResponse(data) {
    try {
      const games = data.fantasy_content?.users?.[0]?.user?.[1]?.games;
      if (!games) return [];

      const gameArray = Array.isArray(games) ? games : [games];
      return gameArray
        .filter(item => item.game)
        .map(item => item.game[0]);
    } catch (error) {
      console.error('Error parsing games response:', error);
      return [];
    }
  },

  parseLeaguesResponse(data) {
    try {
      const games = data.fantasy_content?.users?.[0]?.user?.[1]?.games;
      if (!games) return [];

      let leagues = [];
      const gameArray = Array.isArray(games) ? games : [games];

      gameArray.forEach(gameItem => {
        if (gameItem.game) {
          const leaguesData = gameItem.game[1]?.leagues;
          if (leaguesData) {
            const leagueArray = Array.isArray(leaguesData) ? leaguesData : [leaguesData];
            leagueArray.forEach(item => {
              if (item.league) {
                leagues.push(this.parseLeagueObject(item.league[0]));
              }
            });
          }
        }
      });

      return leagues;
    } catch (error) {
      console.error('Error parsing leagues response:', error);
      return [];
    }
  },

  parseLeagueObject(leagueData) {
    return {
      league_key: leagueData.league_key,
      league_id: leagueData.league_id,
      name: leagueData.name,
      url: leagueData.url,
      season: leagueData.season,
      num_teams: leagueData.num_teams,
      scoring_type: leagueData.scoring_type,
      league_type: leagueData.league_type,
      renew: leagueData.renew,
      renewed: leagueData.renewed,
      current_week: leagueData.current_week,
      start_week: leagueData.start_week,
      end_week: leagueData.end_week,
      game_code: leagueData.game_code
    };
  },

  parseLeagueResponse(data) {
    try {
      const league = data.fantasy_content?.league?.[0];
      return league ? this.parseLeagueObject(league) : null;
    } catch (error) {
      console.error('Error parsing league response:', error);
      return null;
    }
  },

  parseStandingsResponse(data) {
    try {
      const league = data.fantasy_content?.league;
      if (!league) return null;

      const standings = league[1]?.standings?.[0]?.teams;
      if (!standings) return null;

      const teams = [];
      Object.keys(standings).forEach(key => {
        if (key !== 'count') {
          const team = standings[key]?.team;
          if (team) {
            teams.push(this.parseTeamStanding(team[0]));
          }
        }
      });

      return {
        league: this.parseLeagueObject(league[0]),
        teams: teams
      };
    } catch (error) {
      console.error('Error parsing standings response:', error);
      return null;
    }
  },

  parseTeamStanding(teamData) {
    return {
      team_key: teamData.team_key,
      team_id: teamData.team_id,
      name: teamData.name,
      url: teamData.url,
      team_logo: teamData.team_logos?.[0]?.team_logo?.url,
      waiver_priority: teamData.waiver_priority,
      number_of_moves: teamData.number_of_moves,
      number_of_trades: teamData.number_of_trades,
      managers: teamData.managers,
      standings: {
        rank: teamData.team_standings?.rank,
        points_for: teamData.team_standings?.points_for,
        points_against: teamData.team_standings?.points_against
      }
    };
  },

  parseTeamsResponse(data) {
    try {
      const games = data.fantasy_content?.users?.[0]?.user?.[1]?.games;
      if (!games) return [];

      let teams = [];
      const gameArray = Array.isArray(games) ? games : [games];

      gameArray.forEach(gameItem => {
        if (gameItem.game) {
          const teamsData = gameItem.game[1]?.teams;
          if (teamsData) {
            const teamArray = Array.isArray(teamsData) ? teamsData : [teamsData];
            teamArray.forEach(item => {
              if (item.team) {
                teams.push(this.parseTeamStanding(item.team[0]));
              }
            });
          }
        }
      });

      return teams;
    } catch (error) {
      console.error('Error parsing teams response:', error);
      return [];
    }
  },

  parseTeamResponse(data) {
    try {
      const team = data.fantasy_content?.team?.[0];
      return team ? this.parseTeamStanding(team) : null;
    } catch (error) {
      console.error('Error parsing team response:', error);
      return null;
    }
  }
};
