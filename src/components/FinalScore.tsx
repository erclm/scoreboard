import React, { useState } from 'react';
import { Team, League, Tournament } from '../types';

interface FinalScoreProps {
  teams: Team[];
  league?: League;
  tournament?: Tournament;
}

const FinalScore: React.FC<FinalScoreProps> = ({ teams, league, tournament }) => {
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set(teams.map(team => team.id)));

  const calculateLeaguePoints = (team: Team) => {
    return team.wins * 3 + team.draws * 1;
  };

  const toggleTeamVisibility = (teamId: string) => {
    const newHiddenTeams = new Set(hiddenTeams);
    if (newHiddenTeams.has(teamId)) {
      newHiddenTeams.delete(teamId);
    } else {
      newHiddenTeams.add(teamId);
    }
    setHiddenTeams(newHiddenTeams);
  };

  const getSortedLeagueTeams = () => {
    if (!league) return [];
    return [...league.teams].sort((a, b) => {
      const pointsA = calculateLeaguePoints(a);
      const pointsB = calculateLeaguePoints(b);
      if (pointsA !== pointsB) return pointsB - pointsA;
      
      const goalDiffA = a.wins - a.losses;
      const goalDiffB = b.wins - b.losses;
      return goalDiffB - goalDiffA;
    });
  };

  const getTournamentResults = () => {
    if (!tournament || !tournament.completed) return null;

    const final = tournament.games.find(g => g.id === 'final');
    const semi1 = tournament.games.find(g => g.id === 'semi1');
    const semi2 = tournament.games.find(g => g.id === 'semi2');

    if (!final || !semi1 || !semi2) return null;

    const champion = final.result === 'team1' 
      ? tournament.teams.find(t => t.id === final.team1Id)
      : tournament.teams.find(t => t.id === final.team2Id);

    const runnerUp = final.result === 'team1' 
      ? tournament.teams.find(t => t.id === final.team2Id)
      : tournament.teams.find(t => t.id === final.team1Id);

    // Get semi-final losers for 3rd/4th place
    const semi1Loser = semi1.result === 'team1' 
      ? tournament.teams.find(t => t.id === semi1.team2Id)
      : tournament.teams.find(t => t.id === semi1.team1Id);

    const semi2Loser = semi2.result === 'team1' 
      ? tournament.teams.find(t => t.id === semi2.team2Id)
      : tournament.teams.find(t => t.id === semi2.team1Id);

    return {
      champion,
      runnerUp,
      semi1Loser,
      semi2Loser,
      games: tournament.games
    };
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#c0c0c0'; // Silver
      case 3: return '#cd7f32'; // Bronze
      default: return '#00ff00'; // Green
    }
  };

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const sortedDashboardTeams = [...teams].sort((a, b) => b.points - a.points);
  const sortedLeagueTeams = getSortedLeagueTeams();
  const tournamentResults = getTournamentResults();

  return (
    <div>
      <div className="game-info">
        <h2 className="neon-text-cyan">FINAL SCORES</h2>
        <p>Complete results and standings</p>
      </div>

      {/* Dashboard Scores */}
      <div className="standings">
        <h3 className="standings-title">🎯 FINAL SCORES</h3>
        <table className="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Points</th>
              <th>Reveal</th>
            </tr>
          </thead>
          <tbody>
            {sortedDashboardTeams.map((team, index) => (
              <tr key={team.id}>
                <td style={{ color: getRankColor(index + 1), fontWeight: '900' }}>
                  {getMedal(index + 1)} #{index + 1}
                </td>
                <td className="neon-text">
                  {hiddenTeams.has(team.id) ? '***' : team.name}
                </td>
                <td className="neon-text-cyan" style={{ fontSize: '24px', fontWeight: '900' }}>
                  {hiddenTeams.has(team.id) ? '***' : team.points}
                </td>
                <td>
                  <button 
                    onClick={() => toggleTeamVisibility(team.id)}
                    className="retro-button"
                    style={{
                      background: hiddenTeams.has(team.id) ? '#ff0080' : '#00ff80',
                      border: `2px solid ${hiddenTeams.has(team.id) ? '#ff0080' : '#00ff80'}`,
                      color: '#000',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    {hiddenTeams.has(team.id) ? '🫣 REVEAL' : '👁️ HIDE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* League Results */}
      {league && league.completed && (
        <div className="standings">
          <h3 className="standings-title">🏆 LEAGUE FINAL STANDINGS</h3>
          <div className="neon-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
            League: {league.name}
          </div>
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>Goal Diff</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeagueTeams.map((team, index) => (
                <tr key={team.id}>
                  <td style={{ color: getRankColor(index + 1), fontWeight: '900' }}>
                    {getMedal(index + 1)} #{index + 1}
                  </td>
                  <td className="neon-text">{team.name}</td>
                  <td className="neon-text-cyan" style={{ fontSize: '20px', fontWeight: '900' }}>
                    {calculateLeaguePoints(team)}
                  </td>
                  <td>{team.wins}</td>
                  <td>{team.draws}</td>
                  <td>{team.losses}</td>
                  <td>{team.wins - team.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* League Game Results */}
          <div style={{ marginTop: '30px' }}>
            <h4 className="neon-text-cyan" style={{ textAlign: 'center', marginBottom: '20px' }}>
              ALL LEAGUE GAMES
            </h4>
            <div className="rounds-info">
              {league.rounds.map(round => (
                <div key={round.id} className="round-card">
                  <div className="round-title">Round {round.roundNumber}</div>
                  {round.games.map(game => (
                    <div key={game.id} className="game-result" style={{ margin: '8px 0' }}>
                      <span className="neon-text">{getTeamName(game.team1Id)}</span>
                      <span className="vs-text">VS</span>
                      <span className="neon-text">{getTeamName(game.team2Id)}</span>
                      <span className="neon-text-pink" style={{ marginLeft: '15px' }}>
                        {game.result === 'team1' ? `${getTeamName(game.team1Id)} Won` :
                         game.result === 'team2' ? `${getTeamName(game.team2Id)} Won` :
                         game.result === 'draw' ? 'Draw' : 'No Result'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tournament Results */}
      {tournamentResults && (
        <div className="standings">
          <h3 className="standings-title">🏆 TOURNAMENT RESULTS</h3>
          <div className="neon-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Tournament: {tournament!.name}
          </div>
          
          {/* Tournament Podium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div className="team-card" style={{ borderColor: '#ffd700', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
              <div className="neon-text-pink" style={{ fontSize: '24px', fontWeight: '900' }}>
                CHAMPION
              </div>
              <div className="neon-text" style={{ fontSize: '20px', marginTop: '10px' }}>
                {tournamentResults.champion?.name}
              </div>
            </div>

            <div className="team-card" style={{ borderColor: '#c0c0c0', backgroundColor: 'rgba(192, 192, 192, 0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥈</div>
              <div className="neon-text-cyan" style={{ fontSize: '20px', fontWeight: '900' }}>
                RUNNER-UP
              </div>
              <div className="neon-text" style={{ fontSize: '18px', marginTop: '10px' }}>
                {tournamentResults.runnerUp?.name}
              </div>
            </div>

            <div className="team-card" style={{ borderColor: '#cd7f32', backgroundColor: 'rgba(205, 127, 50, 0.1)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🥉</div>
              <div className="neon-text" style={{ fontSize: '18px', fontWeight: '900' }}>
                SEMI-FINALIST
              </div>
              <div className="neon-text" style={{ fontSize: '16px', marginTop: '10px' }}>
                {tournamentResults.semi1Loser?.name}
              </div>
            </div>

            <div className="team-card" style={{ borderColor: '#cd7f32', backgroundColor: 'rgba(205, 127, 50, 0.1)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🥉</div>
              <div className="neon-text" style={{ fontSize: '18px', fontWeight: '900' }}>
                SEMI-FINALIST
              </div>
              <div className="neon-text" style={{ fontSize: '16px', marginTop: '10px' }}>
                {tournamentResults.semi2Loser?.name}
              </div>
            </div>
          </div>

          {/* Tournament Game Results */}
          <div>
            <h4 className="neon-text-cyan" style={{ textAlign: 'center', marginBottom: '20px' }}>
              TOURNAMENT GAMES
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {tournamentResults.games.filter(game => game.completed).map(game => (
                <div key={game.id} className="round-card">
                  <div className="round-title">
                    {game.id === 'semi1' ? 'Semi-Final 1' :
                     game.id === 'semi2' ? 'Semi-Final 2' :
                     game.id === 'final' ? '🏆 FINAL 🏆' : 'Game'}
                  </div>
                  <div className="game-result">
                    <span className={`neon-text ${game.result === 'team1' ? 'neon-text-pink' : ''}`}>
                      {getTeamName(game.team1Id)}
                    </span>
                    <span className="vs-text">VS</span>
                    <span className={`neon-text ${game.result === 'team2' ? 'neon-text-pink' : ''}`}>
                      {getTeamName(game.team2Id)}
                    </span>
                  </div>
                  <div className="neon-text-pink" style={{ textAlign: 'center', marginTop: '10px' }}>
                    Winner: {game.result === 'team1' ? getTeamName(game.team1Id) : getTeamName(game.team2Id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show message if no completed competitions */}
      {(!league || !league.completed) && (!tournament || !tournament.completed) && (
        <div className="retro-container">
          <div className="neon-text" style={{ textAlign: 'center', fontSize: '24px' }}>
            Complete a league or tournament to see final results here!
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalScore;
