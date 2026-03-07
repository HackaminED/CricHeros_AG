import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatchPredictionOptions, predictMatch } from '../api/api';
import { useGender } from '../context/GenderContext';

export default function MatchPredictor() {
  const { gender } = useGender();
  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [venue, setVenue] = useState('');
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('');
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load dropdown options
    getMatchPredictionOptions()
      .then(data => {
        if (data && !data.error) {
          setOptions(data);
          // Set sensible defaults if available
          if (data.teams?.length >= 2) {
            setTeam1(data.teams[0]);
            setTeam2(data.teams[1]);
            setTossWinner(data.teams[0]);
          }
          if (data.venues?.length > 0) setVenue(data.venues[0]);
          if (data.toss_decisions?.length > 0) setTossDecision(data.toss_decisions[0]);
        }
      })
      .catch(err => console.error("Error loading options:", err))
      .finally(() => setLoadingOptions(false));
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (team1 === team2) {
      setError("Team 1 and Team 2 must be different.");
      return;
    }
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await predictMatch(team1, team2, venue, tossWinner, tossDecision, gender);
      setPrediction(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!options) return null;

  const SelectMenu = ({ label, value, onChange, dataList }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pl-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select w-full bg-[var(--surface-muted)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
      >
        {dataList.map(item => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'var(--surface-card)',
          boxShadow: 'var(--shadow-strong)',
          border: '1px solid var(--glass-border)'
        }}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none" style={{ background: 'var(--accent)', filter: 'blur(100px)', transform: 'translate(30%, -30%)' }} />
        
        <div className="p-8 md:p-10 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-[var(--accent)] bg-opacity-10 text-[var(--accent-strong)]">
              🔮
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">AI Match Predictor</h2>
              <p className="text-[var(--text-secondary)]">Simulate match conditions to predict the winner.</p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
              <SelectMenu label="Team 1" value={team1} onChange={setTeam1} dataList={options.teams || []} />
              <SelectMenu label="Team 2" value={team2} onChange={setTeam2} dataList={options.teams || []} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectMenu label="Venue" value={venue} onChange={setVenue} dataList={options.venues || []} />
              <SelectMenu label="Toss Winner" value={tossWinner} onChange={setTossWinner} dataList={[team1, team2]} />
              <SelectMenu label="Toss Decision" value={tossDecision} onChange={setTossDecision} dataList={options.toss_decisions || ['bat', 'field']} />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-red-400 bg-red-400 bg-opacity-10 border border-red-400/20 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)' }}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                'Predict Outcome'
              )}
            </button>
          </form>

          <AnimatePresence>
            {prediction && !loading && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-[var(--glass-border)]">
                  <h3 className="text-center text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-6">Win Probability Preview</h3>
                  
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end px-2">
                      <div className="text-left w-1/3">
                        <div className="text-3xl md:text-5xl font-display font-black" style={{ color: prediction.team1_win_probability >= 0.5 ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {(prediction.team1_win_probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-lg font-bold text-[var(--text-secondary)] mt-1 truncate">{prediction.team1}</div>
                        <div className="text-xs text-[var(--text-primary)] opacity-60 mt-2">
                          Hist. Win Rate: {(prediction.team1_historical_win_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center w-1/3 pb-2 text-[var(--text-secondary)] font-medium italic text-sm opacity-60">VS</div>
                      
                      <div className="text-right w-1/3">
                        <div className="text-3xl md:text-5xl font-display font-black" style={{ color: prediction.team2_win_probability > 0.5 ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {(prediction.team2_win_probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-lg font-bold text-[var(--text-secondary)] mt-1 truncate">{prediction.team2}</div>
                        <div className="text-xs text-[var(--text-primary)] opacity-60 mt-2">
                          Hist. Win Rate: {(prediction.team2_historical_win_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Fancy Meter Strip */}
                    <div className="h-4 md:h-6 w-full rounded-full overflow-hidden flex relative shadow-inner" style={{ background: 'var(--surface-muted)' }}>
                      <motion.div
                        initial={{ width: '50%' }}
                        animate={{ width: `${prediction.team1_win_probability * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full relative"
                        style={{ background: 'var(--accent)', boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.2)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ width: '50%' }}
                        animate={{ width: `${prediction.team2_win_probability * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full relative"
                        style={{ background: 'var(--text-secondary)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20"></div>
                      </motion.div>
                      
                      {/* Center Mark */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/30 z-10 transform -translate-x-1/2"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
