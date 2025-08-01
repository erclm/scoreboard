import React, { useState } from 'react';
import { Team, Tournament, Game } from '../types';

interface TournamentModeProps {
  teams: Team[];
  tournament?: Tournament;
  onTournamentUpdate: (tournament: Tournament) => void;
}

const TournamentMode: React.FC<TournamentModeProps> = ({
  teams,
  tournament,
  onTournamentUpdate,
}) => {
  const [newTournamentName, setNewTournamentName] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const createTournament = () => {
    if (!newTournamentName.trim()) {
      alert('Please enter a tournament name');
      return;
    }

    if (selectedTeams.length !== 4) {
      alert('Please select exactly 4 teams for the tournament');
      return;
    }

    const tournamentTeams = teams.filter(team => selectedTeams.includes(team.id));
    
    // Create tournament bracket: Semi-final 1, Semi-final 2, Final
    const games: Game[] = [
      {
        id: 'semi1',
        team1Id: tournamentTeams[0].id,
        team2Id: tournamentTeams[1].id,
        completed: false,
      },
      {
        id: 'semi2',
        team1Id: tournamentTeams[2].id,
        team2Id: tournamentTeams[3].id,
        completed: false,
      },
      {
        id: 'final',
        team1Id: '', // Will be filled after semi-finals
        team2Id: '', // Will be filled after semi-finals
        completed: false,
      },
    ];

    const newTournament: Tournament = {
      id: `tournament-${Date.now()}`,
      name: newTournamentName.trim(),
      teams: tournamentTeams,
      currentGameIndex: 0,
      games,
      completed: false,
    };

    onTournamentUpdate(newTournament);
    setNewTournamentName('');
    setSelectedTeams([]);
  };

  const updateGameResult = (gameId: string, result: 'team1' | 'team2') => {
    if (!tournament) return;

    const updatedGames = [...tournament.games];
    const gameIndex = updatedGames.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
      updatedGames[gameIndex] = { ...updatedGames[gameIndex], result, completed: true };
      
      // If this was a semi-final, update the final game
      if (gameId === 'semi1' || gameId === 'semi2') {
        const winnerTeamId = result === 'team1' 
          ? updatedGames[gameIndex].team1Id 
          : updatedGames[gameIndex].team2Id;
          
        const finalGame = updatedGames.find(g => g.id === 'final');
        if (finalGame) {
          if (gameId === 'semi1') {
            finalGame.team1Id = winnerTeamId;
          } else {
            finalGame.team2Id = winnerTeamId;
          }
        }
      }
      
      // Update current game index
      let newCurrentGameIndex = tournament.currentGameIndex;
      if (gameId === 'semi1' && updatedGames[1].completed) {
        newCurrentGameIndex = 2; // Move to final
      } else if (gameId === 'semi2' && updatedGames[0].completed) {
        newCurrentGameIndex = 2; // Move to final
      } else if (gameId === 'final') {
        newCurrentGameIndex = 3; // Tournament completed
      } else if (gameId === 'semi1') {
        newCurrentGameIndex = 1; // Move to semi2
      }

      const updatedTournament = {
        ...tournament,
        games: updatedGames,
        currentGameIndex: newCurrentGameIndex,
        completed: gameId === 'final',
      };

      onTournamentUpdate(updatedTournament);
    }
  };

  const resetTournament = () => {
    if (confirm('Reset the tournament? This will clear all results.')) {
      const resetGames = tournament!.games.map(game => ({
        ...game,
        result: undefined,
        completed: false,
        ...(game.id === 'final' ? { team1Id: '', team2Id: '' } : {})
      }));

      onTournamentUpdate({
        ...tournament!,
        currentGameIndex: 0,
        completed: false,
        games: resetGames,
      });
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else if (selectedTeams.length < 4) {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const getCurrentGame = () => {
    if (!tournament || tournament.currentGameIndex >= tournament.games.length) return null;
    return tournament.games[tournament.currentGameIndex];
  };

  const getGameTitle = (game: Game) => {
    if (game.id === 'semi1') return 'Semi-Final 1';
    if (game.id === 'semi2') return 'Semi-Final 2';
    if (game.id === 'final') return 'FINAL';
    return 'Game';
  };

  if (!tournament) {
    return (
      <div>
        <div className="game-info">
          <h2 className="neon-text-cyan">TOURNAMENT FORMAT</h2>
          <p>Select top 4 teams for knockout tournament</p>
        </div>

        <div className="controls-panel">
          <input
            type="text"
            value={newTournamentName}
            onChange={(e) => setNewTournamentName(e.target.value)}
            placeholder="Enter tournament name"
            className="retro-input"
            style={{ marginRight: '15px' }}
          />
          <button 
            className="retro-button" 
            onClick={createTournament}
            disabled={selectedTeams.length !== 4}
          >
            Create Tournament ({selectedTeams.length}/4)
          </button>
        </div>

        <div className="game-info">
          <h3 className="neon-text">Select 4 Teams:</h3>
        </div>

        <div className="scoreboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {teams.map(team => (
            <div 
              key={team.id} 
              className={`team-card ${selectedTeams.includes(team.id) ? 'selected' : ''}`}
              onClick={() => toggleTeamSelection(team.id)}
              style={{ 
                cursor: 'pointer',
                borderColor: selectedTeams.includes(team.id) ? '#ff00ff' : '#00ff00',
                backgroundColor: selectedTeams.includes(team.id) ? 'rgba(255, 0, 255, 0.2)' : 'rgba(0, 0, 0, 0.9)'
              }}
            >
              <h3 className="team-name neon-text">{team.name}</h3>
              <div className="team-score neon-text-cyan">{team.points}</div>
              {selectedTeams.includes(team.id) && (
                <div className="neon-text-pink" style={{ marginTop: '10px' }}>
                  ✓ SELECTED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentGame = getCurrentGame();
  const semi1 = tournament.games[0];
  const semi2 = tournament.games[1];
  const final = tournament.games[2];

  return (
    <div>
      <div className="game-info">
        <h2 className="neon-text-cyan">TOURNAMENT: {tournament.name}</h2>
        <p>
          {tournament.completed 
            ? 'TOURNAMENT COMPLETED!' 
            : currentGame 
            ? `Current: ${getGameTitle(currentGame)}`
            : 'Tournament Complete'
          }
        </p>
      </div>

      <div className="controls-panel">
        <button className="retro-button" onClick={resetTournament}>
          Reset Tournament
        </button>
      </div>

      {/* Tournament Bracket */}
      <div className="retro-container">
        <h3 className="neon-text">TOURNAMENT BRACKET</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
          {/* Semi-Finals */}
          <div>
            <h4 className="neon-text-cyan" style={{ textAlign: 'center', marginBottom: '20px' }}>
              SEMI-FINALS
            </h4>
            
            {/* Semi-Final 1 */}
            <div className="round-card" style={{ marginBottom: '20px' }}>
              <div className="round-title">Semi-Final 1</div>
              <div className="game-result">
                <span className={`neon-text ${semi1.result === 'team1' ? 'neon-text-pink' : ''}`}>
                  {getTeamName(semi1.team1Id)}
                </span>
                <span className="vs-text">VS</span>
                <span className={`neon-text ${semi1.result === 'team2' ? 'neon-text-pink' : ''}`}>
                  {getTeamName(semi1.team2Id)}
                </span>
              </div>
              {!semi1.completed && currentGame?.id === 'semi1' && (
                <div className="result-buttons">
                  <button
                    className="retro-button result-button"
                    onClick={() => updateGameResult('semi1', 'team1')}
                  >
                    {getTeamName(semi1.team1Id)} Wins
                  </button>
                  <button
                    className="retro-button result-button"
                    onClick={() => updateGameResult('semi1', 'team2')}
                  >
                    {getTeamName(semi1.team2Id)} Wins
                  </button>
                </div>
              )}
              {semi1.completed && (
                <div className="neon-text-pink" style={{ textAlign: 'center', marginTop: '10px' }}>
                  Winner: {semi1.result === 'team1' ? getTeamName(semi1.team1Id) : getTeamName(semi1.team2Id)}
                </div>
              )}
            </div>

            {/* Semi-Final 2 */}
            <div className="round-card">
              <div className="round-title">Semi-Final 2</div>
              <div className="game-result">
                <span className={`neon-text ${semi2.result === 'team1' ? 'neon-text-pink' : ''}`}>
                  {getTeamName(semi2.team1Id)}
                </span>
                <span className="vs-text">VS</span>
                <span className={`neon-text ${semi2.result === 'team2' ? 'neon-text-pink' : ''}`}>
                  {getTeamName(semi2.team2Id)}
                </span>
              </div>
              {!semi2.completed && currentGame?.id === 'semi2' && (
                <div className="result-buttons">
                  <button
                    className="retro-button result-button"
                    onClick={() => updateGameResult('semi2', 'team1')}
                  >
                    {getTeamName(semi2.team1Id)} Wins
                  </button>
                  <button
                    className="retro-button result-button"
                    onClick={() => updateGameResult('semi2', 'team2')}
                  >
                    {getTeamName(semi2.team2Id)} Wins
                  </button>
                </div>
              )}
              {semi2.completed && (
                <div className="neon-text-pink" style={{ textAlign: 'center', marginTop: '10px' }}>
                  Winner: {semi2.result === 'team1' ? getTeamName(semi2.team1Id) : getTeamName(semi2.team2Id)}
                </div>
              )}
            </div>
          </div>

          {/* Final */}
          <div>
            <h4 className="neon-text-cyan" style={{ textAlign: 'center', marginBottom: '20px' }}>
              FINAL
            </h4>
            
            <div className="round-card" style={{ borderColor: '#ff00ff' }}>
              <div className="round-title">🏆 FINAL 🏆</div>
              {final.team1Id && final.team2Id ? (
                <>
                  <div className="game-result">
                    <span className={`neon-text ${final.result === 'team1' ? 'neon-text-pink' : ''}`}>
                      {getTeamName(final.team1Id)}
                    </span>
                    <span className="vs-text">VS</span>
                    <span className={`neon-text ${final.result === 'team2' ? 'neon-text-pink' : ''}`}>
                      {getTeamName(final.team2Id)}
                    </span>
                  </div>
                  {!final.completed && currentGame?.id === 'final' && (
                    <div className="result-buttons">
                      <button
                        className="retro-button result-button"
                        onClick={() => updateGameResult('final', 'team1')}
                      >
                        {getTeamName(final.team1Id)} Wins
                      </button>
                      <button
                        className="retro-button result-button"
                        onClick={() => updateGameResult('final', 'team2')}
                      >
                        {getTeamName(final.team2Id)} Wins
                      </button>
                    </div>
                  )}
                  {final.completed && (
                    <div className="neon-text-pink" style={{ textAlign: 'center', marginTop: '15px', fontSize: '24px' }}>
                      🏆 CHAMPION: {final.result === 'team1' ? getTeamName(final.team1Id) : getTeamName(final.team2Id)} 🏆
                    </div>
                  )}
                </>
              ) : (
                <div className="neon-text" style={{ textAlign: 'center', padding: '20px' }}>
                  Waiting for semi-final winners...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentMode;
