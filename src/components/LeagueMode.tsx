import React, { useState } from 'react';
import { Team, League, Round, Game } from '../types';

interface LeagueModeProps {
  teams: Team[];
  league?: League;
  onTeamsUpdate: (teams: Team[]) => void;
  onLeagueUpdate: (league: League) => void;
}

const LeagueMode: React.FC<LeagueModeProps> = ({
  teams,
  league,
  onTeamsUpdate,
  onLeagueUpdate,
}) => {
  const [newLeagueName, setNewLeagueName] = useState('');

  const createLeague = () => {
    if (!newLeagueName.trim()) {
      alert('Please enter a league name');
      return;
    }

    // Generate all possible rounds for 8 teams (4 games per round)
    const rounds: Round[] = [];
    const totalTeams = 8;
    const gamesPerRound = 4;
    
    // Simple round-robin style scheduling for 8 teams (7 rounds)
    for (let roundNum = 1; roundNum <= 7; roundNum++) {
      const games: Game[] = [];
      
      // Generate 4 games for this round
      for (let gameNum = 0; gameNum < gamesPerRound; gameNum++) {
        const team1Index = (roundNum - 1 + gameNum * 2) % totalTeams;
        const team2Index = (roundNum - 1 + gameNum * 2 + 1) % totalTeams;
        
        if (team1Index !== team2Index) {
          games.push({
            id: `round-${roundNum}-game-${gameNum + 1}`,
            team1Id: teams[team1Index].id,
            team2Id: teams[team2Index].id,
            completed: false,
          });
        }
      }
      
      rounds.push({
        id: `round-${roundNum}`,
        roundNumber: roundNum,
        games,
        completed: false,
      });
    }

    const newLeague: League = {
      id: `league-${Date.now()}`,
      name: newLeagueName.trim(),
      teams: teams.map(team => ({ ...team, wins: 0, losses: 0, draws: 0 })),
      rounds,
      currentRound: 1,
      completed: false,
    };

    onLeagueUpdate(newLeague);
    setNewLeagueName('');
  };

  const updateGameResult = (roundId: string, gameId: string, result: 'team1' | 'team2' | 'draw') => {
    if (!league) return;

    const updatedRounds = league.rounds.map(round => {
      if (round.id === roundId) {
        const updatedGames = round.games.map(game => {
          if (game.id === gameId) {
            return { ...game, result, completed: true };
          }
          return game;
        });
        
        const allGamesCompleted = updatedGames.every(game => game.completed);
        return { ...round, games: updatedGames, completed: allGamesCompleted };
      }
      return round;
    });

    // Reset all team stats and recalculate from scratch
    const updatedTeams = league.teams.map(team => ({
      ...team,
      wins: 0,
      losses: 0,
      draws: 0
    }));

    // Recalculate stats from all completed games
    updatedRounds.forEach(round => {
      round.games.forEach(game => {
        if (game.completed && game.result) {
          const team1 = updatedTeams.find(t => t.id === game.team1Id);
          const team2 = updatedTeams.find(t => t.id === game.team2Id);
          
          if (team1 && team2) {
            if (game.result === 'team1') {
              team1.wins++;
              team2.losses++;
            } else if (game.result === 'team2') {
              team2.wins++;
              team1.losses++;
            } else if (game.result === 'draw') {
              team1.draws++;
              team2.draws++;
            }
          }
        }
      });
    });

    // Apply league points to main dashboard scores
    const updatedMainTeams = teams.map(mainTeam => {
      const leagueTeam = updatedTeams.find(t => t.id === mainTeam.id);
      if (leagueTeam) {
        const leaguePoints = leagueTeam.wins * 300 + leagueTeam.draws * 50 + leagueTeam.losses * 0;
        return { ...mainTeam, points: mainTeam.points + leaguePoints - (calculatePoints(league.teams.find(t => t.id === mainTeam.id) || mainTeam)) };
      }
      return mainTeam;
    });

    const updatedLeague = { ...league, rounds: updatedRounds, teams: updatedTeams };
    onLeagueUpdate(updatedLeague);
    onTeamsUpdate(updatedMainTeams);
  };

  const nextRound = () => {
    if (!league) return;

    const currentRound = league.rounds.find(r => r.roundNumber === league.currentRound);
    if (!currentRound?.completed) {
      alert('Please complete all games in the current round before proceeding');
      return;
    }

    if (league.currentRound >= league.rounds.length) {
      // League completed
      onLeagueUpdate({ ...league, completed: true });
      return;
    }

    onLeagueUpdate({ ...league, currentRound: league.currentRound + 1 });
  };

  const resetLeague = () => {
    if (confirm('Reset the entire league? This will clear all results.')) {
      onLeagueUpdate({
        ...league!,
        currentRound: 1,
        completed: false,
        teams: teams.map(team => ({ ...team, wins: 0, losses: 0, draws: 0 })),
        rounds: league!.rounds.map(round => ({
          ...round,
          completed: false,
          games: round.games.map(game => ({ ...game, result: undefined, completed: false }))
        }))
      });
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const calculatePoints = (team: Team) => {
    return team.wins * 300 + team.draws * 50 + team.losses * 0;
  };

  const sortedTeams = league ? [...league.teams].sort((a, b) => {
    const pointsA = calculatePoints(a);
    const pointsB = calculatePoints(b);
    if (pointsA !== pointsB) return pointsB - pointsA;
    
    const goalDiffA = a.wins - a.losses;
    const goalDiffB = b.wins - b.losses;
    return goalDiffB - goalDiffA;
  }) : [];

  if (!league) {
    return (
      <div>
        <div className="game-info">
          <h2 className="arcade-text">LEAGUE FORMAT</h2>
          <p>8 teams, 4 simultaneous games per round</p>
        </div>

        <div className="controls-panel">
          <input
            type="text"
            value={newLeagueName}
            onChange={(e) => setNewLeagueName(e.target.value)}
            placeholder="Enter league name"
            className="retro-input"
            style={{ marginRight: '15px' }}
          />
          <button className="retro-button" onClick={createLeague}>
            Create League
          </button>
        </div>
      </div>
    );
  }

  const currentRound = league.rounds.find(r => r.roundNumber === league.currentRound);
  const remainingRounds = league.rounds.length - league.currentRound + 1;

  return (
    <div className="league-page">
      <div className="game-info">
        <h2 className="arcade-text" style={{ fontSize: '32px', marginBottom: '15px' }}>LEAGUE: {league.name}</h2>
        <p style={{ fontSize: '24px', fontFamily: 'Space Mono, monospace', marginBottom: '8px' }}>Round {league.currentRound} of {league.rounds.length}</p>
        <p className="arcade-text-accent" style={{ fontSize: '26px' }}>
          {league.completed ? 'LEAGUE COMPLETED!' : `${remainingRounds} rounds remaining`}
        </p>
      </div>

      <div className="controls-panel">
        {!league.completed && currentRound?.completed && (
          <button className="retro-button" onClick={nextRound}>
            Next Round
          </button>
        )}
        <button className="retro-button" onClick={resetLeague}>
          Reset League
        </button>
      </div>

      <div className="league-main">
        <div className="standings-section">
          <div className="standings">
            <h3 className="standings-title arcade-text">LIVE STANDINGS</h3>
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
                {sortedTeams.map((team, index) => (
                  <tr key={team.id} className={index < 3 ? 'top-team' : ''}>
                    <td className="arcade-text-accent">#{index + 1}</td>
                    <td className="arcade-text-bright">{team.name}</td>
                    <td className="arcade-text" style={{ fontSize: '28px', fontWeight: 'bold' }}>{calculatePoints(team)}</td>
                    <td>{team.wins}</td>
                    <td>{team.draws}</td>
                    <td>{team.losses}</td>
                    <td>{team.wins - team.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="games-section">
          {currentRound && !league.completed && (
            <div className="games-container">
              <h3 className="arcade-text-bright" style={{ fontSize: '20px', marginBottom: '15px', textAlign: 'center' }}>Round {currentRound.roundNumber}</h3>
              <div className="games-grid">
                {currentRound.games.map(game => (
                  <div key={game.id} className="game-row">
                    <button
                      className={`team-btn ${game.result === 'team1' ? 'selected' : ''}`}
                      onClick={() => updateGameResult(currentRound.id, game.id, 'team1')}
                    >
                      🏆
                    </button>
                    <span className="team-name arcade-text-bright">{getTeamName(game.team1Id)}</span>
                    <button
                      className={`draw-btn ${game.result === 'draw' ? 'selected' : ''}`}
                      onClick={() => updateGameResult(currentRound.id, game.id, 'draw')}
                    >
                      D
                    </button>
                    <span className="team-name arcade-text-bright">{getTeamName(game.team2Id)}</span>
                    <button
                      className={`team-btn ${game.result === 'team2' ? 'selected' : ''}`}
                      onClick={() => updateGameResult(currentRound.id, game.id, 'team2')}
                    >
                      🏆
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {league.completed && (
            <div className="games-container">
              <h3 className="arcade-text-accent" style={{ fontSize: '24px', textAlign: 'center' }}>
                🏆 COMPLETED! 🏆
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueMode;
