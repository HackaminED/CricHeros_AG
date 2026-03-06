import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

// Players
export const getPlayers = (search = '', limit = 100) =>
    api.get('/players', { params: { search, limit } }).then(r => r.data);

export const getPlayerImpact = (name) =>
    api.get(`/players/${encodeURIComponent(name)}/impact`).then(r => r.data);

export const getPlayerTrend = (name, window = 10) =>
    api.get(`/players/${encodeURIComponent(name)}/trend`, { params: { window } }).then(r => r.data);

// Leaderboard
export const getLeaderboard = (limit = 50, role = null) =>
    api.get('/leaderboard', { params: { limit, ...(role ? { role } : {}) } }).then(r => r.data);

// Matches
export const getMatches = (limit = 50) =>
    api.get('/matches', { params: { limit } }).then(r => r.data);

export const getMatch = (matchId) =>
    api.get(`/matches/${matchId}`).then(r => r.data);

// Stats
export const getStats = () =>
    api.get('/stats').then(r => r.data);

export default api;
