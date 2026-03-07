import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

// Players
export const getPlayers = async (search = '', limit = 100, gender = 'Men') => {
    if (search) {
        const response = await api.get('/players/search', { params: { q: search, limit, gender } });
        return response.data;
    }
    const params = { limit, gender };
    const response = await api.get('/players', { params });
    return response.data;
};

export const getPlayerImpact = async (playerName, lastN = 10, gender = 'Men') => {
    const response = await api.get(`/players/${encodeURIComponent(playerName)}/impact`, {
        params: { last_n: lastN, gender }
    });
    return response.data;
};

export const getPlayerTrend = async (playerName, lastN = 10, gender = 'Men') => {
    const response = await api.get(`/players/${encodeURIComponent(playerName)}/trend`, {
        params: { last_n: lastN, gender }
    });
    return response.data;
};

// Leaderboard
export const getLeaderboard = async (limit = 50, minInnings = 10, role = null, teams = null, gender = 'Men') => {
    const params = { limit, min_innings: minInnings, gender };
    if (role) params.role = role;
    if (teams) params.teams = teams;
    const response = await api.get('/leaderboard', { params });
    return response.data;
};

// Matches
export const getMatches = async (limit = 50, team = null, gender = 'Men') => {
    const params = { limit, gender };
    if (team) params.team = team;
    const response = await api.get('/matches', { params });
    return response.data;
};

export const getMatch = (matchId) =>
    api.get(`/matches/${matchId}`).then(r => r.data);

// Stats
export const getStats = () =>
    api.get('/stats').then(r => r.data);

export default api;
