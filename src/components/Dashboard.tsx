import React, { useState } from 'react';
import { Team } from '../types';

interface DashboardProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ teams, onTeamsUpdate }) => {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  const updateTeamPoints = (teamId: string, change: number) => {
    const updatedTeams = teams.map(team =>
      team.id === teamId
        ? { ...team, points: Math.max(0, team.points + change) }
        : team
    );
    onTeamsUpdate(updatedTeams);
  };

  const setTeamPoints = (teamId: string, points: number) => {
    const updatedTeams = teams.map(team =>
      team.id === teamId
        ? { ...team, points: Math.max(0, points) }
        : team
    );
    onTeamsUpdate(updatedTeams);
  };

  const startEditingName = (team: Team) => {
    setEditingTeam(team.id);
    setEditingName(team.name);
  };

  const saveTeamName = (teamId: string) => {
    if (editingName.trim()) {
      const updatedTeams = teams.map(team =>
        team.id === teamId
          ? { ...team, name: editingName.trim() }
          : team
      );
      onTeamsUpdate(updatedTeams);
    }
    setEditingTeam(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingTeam(null);
    setEditingName('');
  };



  return (
    <div>

      <div className="scoreboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {sortedTeams.map((team, index) => (
          <div key={team.id} className="team-card">
            <div className="arcade-text-accent" style={{ fontSize: '16px', marginBottom: '10px' }}>
              #{index + 1}
            </div>
            
            {editingTeam === team.id ? (
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="retro-input"
                  style={{ width: '100%', marginBottom: '10px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveTeamName(team.id);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    className="retro-button"
                    onClick={() => saveTeamName(team.id)}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Save
                  </button>
                  <button
                    className="retro-button"
                    onClick={cancelEditing}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h3
                className="team-name arcade-text-bright"
                onClick={() => startEditingName(team)}
                style={{ cursor: 'pointer', marginBottom: '15px', fontSize: '24px' }}
                title="Click to edit team name"
              >
                {team.name}
              </h3>
            )}

            <div className="team-score arcade-text" style={{ fontSize: '48px', fontWeight: '700', margin: '15px 0' }}>
              {team.points}
            </div>

            <div className="controls-panel" style={{ marginTop: '20px' }}>
              <button
                className="retro-button"
                onClick={() => updateTeamPoints(team.id, -25)}
                style={{ backgroundColor: '#ff0040', padding: '8px 12px', fontSize: '14px' }}
              >
                -25
              </button>
              <button
                className="retro-button"
                onClick={() => updateTeamPoints(team.id, -10)}
                style={{ backgroundColor: '#ff4040', padding: '8px 12px', fontSize: '14px' }}
              >
                -10
              </button>
              <button
                className="retro-button"
                onClick={() => updateTeamPoints(team.id, 10)}
                style={{ backgroundColor: '#40ff40', padding: '8px 12px', fontSize: '14px' }}
              >
                +10
              </button>
              <button
                className="retro-button"
                onClick={() => updateTeamPoints(team.id, 25)}
                style={{ backgroundColor: '#00ff40', padding: '8px 12px', fontSize: '14px' }}
              >
                +25
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              <input
                type="number"
                placeholder="Set points"
                className="retro-input"
                style={{ width: '120px', marginRight: '10px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const points = parseInt(input.value);
                    if (!isNaN(points)) {
                      setTeamPoints(team.id, points);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                className="retro-button"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const points = parseInt(input.value);
                  if (!isNaN(points)) {
                    setTeamPoints(team.id, points);
                    input.value = '';
                  }
                }}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Set
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
