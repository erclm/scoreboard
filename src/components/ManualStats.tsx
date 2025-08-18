import React, { useState } from 'react';
import { Team } from '../types';

interface ManualStatsProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
}

const ManualStats: React.FC<ManualStatsProps> = ({ teams, onTeamsUpdate }) => {
  const [editingStats, setEditingStats] = useState<{ [teamId: string]: { wins: number; losses: number; draws: number } }>({});

  const initializeEditingStats = () => {
    const stats: { [teamId: string]: { wins: number; losses: number; draws: number } } = {};
    teams.forEach(team => {
      stats[team.id] = { wins: team.wins, losses: team.losses, draws: team.draws };
    });
    setEditingStats(stats);
  };

  const updateStat = (teamId: string, stat: 'wins' | 'losses' | 'draws', value: number) => {
    setEditingStats(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [stat]: Math.max(0, value)
      }
    }));
  };

  const calculateLeaguePoints = (wins: number, draws: number, losses: number) => {
    return wins * 300 + draws * 50 + losses * 0;
  };

  const applyStatsToScoreboard = () => {
    const updatedTeams = teams.map(team => {
      const stats = editingStats[team.id] || { wins: team.wins, losses: team.losses, draws: team.draws };
      const currentLeaguePoints = calculateLeaguePoints(team.wins, team.draws, team.losses);
      const newLeaguePoints = calculateLeaguePoints(stats.wins, stats.draws, stats.losses);
      const pointsDifference = newLeaguePoints - currentLeaguePoints;
      
      return {
        ...team,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        points: team.points + pointsDifference // Apply league points directly to main scoreboard
      };
    });

    onTeamsUpdate(updatedTeams);
    alert('Stats applied to scoreboard! League points added to main scores.');
  };

  const resetAllStats = () => {
    if (confirm('Reset all W/L/D stats? This will remove league points from main scoreboard.')) {
      const updatedTeams = teams.map(team => {
        const currentLeaguePoints = calculateLeaguePoints(team.wins, team.draws, team.losses);
        return {
          ...team,
          wins: 0,
          losses: 0,
          draws: 0,
          points: team.points - currentLeaguePoints
        };
      });
      
      onTeamsUpdate(updatedTeams);
      setEditingStats({});
    }
  };

  // Initialize editing stats if empty
  React.useEffect(() => {
    if (Object.keys(editingStats).length === 0) {
      initializeEditingStats();
    }
  }, [teams]);

  const sortedTeams = [...teams].sort((a, b) => {
    const pointsA = calculateLeaguePoints(a.wins, a.draws, a.losses);
    const pointsB = calculateLeaguePoints(b.wins, b.draws, b.losses);
    if (pointsA !== pointsB) return pointsB - pointsA;
    
    const goalDiffA = a.wins - a.losses;
    const goalDiffB = b.wins - b.losses;
    return goalDiffB - goalDiffA;
  });

  return (
    <div className="manual-stats-page">
      <div className="game-info">
        <h2 className="arcade-text" style={{ fontSize: '32px', marginBottom: '15px' }}>MANUAL W/L/D INPUT</h2>
        <p style={{ fontSize: '18px', fontFamily: 'Space Mono, monospace', marginBottom: '8px' }}>
          Enter wins, losses, and draws manually
        </p>
        <p style={{ fontSize: '16px', color: '#ffaa00' }}>
          Win = 300 points • Draw = 50 points • Loss = 0 points
        </p>
      </div>

      <div className="controls-panel">
        <button className="retro-button" onClick={applyStatsToScoreboard}>
          Apply to Scoreboard
        </button>
        <button className="retro-button" onClick={resetAllStats}>
          Reset All Stats
        </button>
      </div>

      <div className="manual-stats-layout">
        <div className="stats-input-section">
          <h3 className="arcade-text-bright" style={{ fontSize: '20px', marginBottom: '15px', textAlign: 'center' }}>
            Input Stats
          </h3>
          
          <div className="stats-grid">
            {teams.map(team => {
              const stats = editingStats[team.id] || { wins: 0, losses: 0, draws: 0 };
              const leaguePoints = calculateLeaguePoints(stats.wins, stats.draws, stats.losses);
              
              return (
                <div key={team.id} className="team-stats-card">
                  <h4 className="arcade-text-bright" style={{ fontSize: '18px', marginBottom: '10px' }}>
                    {team.name}
                  </h4>
                  
                  <div className="stat-inputs">
                    <div className="stat-input-group">
                      <label>Wins</label>
                      <div className="stat-input-controls">
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'wins', stats.wins - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={stats.wins}
                          onChange={(e) => updateStat(team.id, 'wins', parseInt(e.target.value) || 0)}
                          className="stat-input"
                          min="0"
                        />
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'wins', stats.wins + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="stat-input-group">
                      <label>Draws</label>
                      <div className="stat-input-controls">
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'draws', stats.draws - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={stats.draws}
                          onChange={(e) => updateStat(team.id, 'draws', parseInt(e.target.value) || 0)}
                          className="stat-input"
                          min="0"
                        />
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'draws', stats.draws + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="stat-input-group">
                      <label>Losses</label>
                      <div className="stat-input-controls">
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'losses', stats.losses - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={stats.losses}
                          onChange={(e) => updateStat(team.id, 'losses', parseInt(e.target.value) || 0)}
                          className="stat-input"
                          min="0"
                        />
                        <button 
                          className="stat-btn"
                          onClick={() => updateStat(team.id, 'losses', stats.losses + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="league-points" style={{ marginTop: '10px', textAlign: 'center' }}>
                    <span className="arcade-text" style={{ fontSize: '16px', color: '#00ff80' }}>
                      League Points: {leaguePoints}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="standings-section">
          <div className="standings">
            <h3 className="standings-title arcade-text">CALCULATED STANDINGS</h3>
            <table className="standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Points</th>
                  <th>Wins</th>
                  <th>Draw</th>
                  <th>Loss</th>
                  <th>Diff</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, index) => {
                  const stats = editingStats[team.id] || { wins: team.wins, losses: team.losses, draws: team.draws };
                  const leaguePoints = calculateLeaguePoints(stats.wins, stats.draws, stats.losses);
                  
                  return (
                    <tr key={team.id} className={index < 3 ? 'top-team' : ''}>
                      <td className="arcade-text-accent">#{index + 1}</td>
                      <td className="arcade-text-bright">{team.name}</td>
                      <td className="arcade-text" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                        {leaguePoints}
                      </td>
                      <td>{stats.wins}</td>
                      <td>{stats.draws}</td>
                      <td>{stats.losses}</td>
                      <td>{stats.wins - stats.losses}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualStats;
