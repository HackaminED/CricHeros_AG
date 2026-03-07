import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, getMatch } from '../api/api';
import { useGender } from '../context/GenderContext';
import MatchList from '../components/MatchList';
import MatchDetail from '../components/MatchDetail';

export default function MatchExplorer() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { gender } = useGender();
  const [matches, setMatches] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      loadMatch(matchId);
    } else {
      loadMatches(gender);
    }
  }, [matchId, gender]);

  const loadMatches = async (currentGender) => {
    setLoading(true);
    try {
      const data = await getMatches(100, null, currentGender);
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatch = async (id) => {
    setLoading(true);
    try {
      const data = await getMatch(id);
      setMatchData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!matchId) {
    return (
      <div className="animate-page-enter">
        <header className="mb-10">
          <h1 className="font-display font-bold text-[var(--text-primary)] text-3xl md:text-4xl tracking-tight">
            {gender}'s Match Explorer
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-base">
            Browse recent matches and see impact breakdowns
          </p>
        </header>
        <MatchList matches={matches} loading={loading} winnerTeamLabel />
      </div>
    );
  }

  return (
    <MatchDetail
      matchId={matchId}
      matchData={matchData}
      loading={loading}
      onBack={() => navigate('/matches')}
    />
  );
}
