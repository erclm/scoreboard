import React, { useState, useEffect, useRef } from 'react';
import { AppState, GameMode, Team, League } from './types';
import { saveData, loadData, exportData, importData } from './utils/storage';
import Dashboard from './components/Dashboard';
import LeagueMode from './components/LeagueMode';

import FinalScore from './components/FinalScore';

const initialTeams: Team[] = Array.from({ length: 8 }, (_, i) => ({
  id: `team-${i + 1}`,
  name: `Team ${i + 1}`,
  points: 0,
  wins: 0,
  losses: 0,
  draws: 0,
}));

const initialState: AppState = {
  gameMode: 'dashboard',
  teams: initialTeams,
};

function App() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = loadData();
    if (savedData) {
      setAppState(savedData);
    }
  }, []);

  useEffect(() => {
    saveData(appState);
  }, [appState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModeChange = (mode: GameMode) => {
    setAppState(prev => ({ ...prev, gameMode: mode }));
  };

  const handleTeamsUpdate = (teams: Team[]) => {
    setAppState(prev => ({ ...prev, teams }));
  };

  const handleLeagueUpdate = (league: League) => {
    setAppState(prev => ({ ...prev, league }));
  };



  const handleExportData = () => {
    exportData(appState);
    setDropdownOpen(false);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedData = await importData(file);
        setAppState(importedData);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    }
    setDropdownOpen(false);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setAppState(initialState);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="app">
      <div className="retro-container">
        <div className="header-container">
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              className="dropdown-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              ⚙️
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleExportData}>
                  Export Data
                </button>
                <label className="dropdown-item" style={{ cursor: 'pointer' }}>
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden-input"
                  />
                </label>
                <button className="dropdown-item" onClick={handleResetData}>
                  Reset All
                </button>
              </div>
            )}
          </div>
          <h1 className="arcade-text" style={{ textAlign: 'center', fontSize: '56px', marginBottom: '20px', letterSpacing: '4px' }}>
            ⭐ SCOREBOARD ⭐
          </h1>
        </div>
        
        <div className="mode-selector">
          <button
            className={`retro-button mode-button ${appState.gameMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleModeChange('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`retro-button mode-button ${appState.gameMode === 'league' ? 'active' : ''}`}
            onClick={() => handleModeChange('league')}
          >
            League
          </button>

          <button
            className={`retro-button mode-button ${appState.gameMode === 'final' ? 'active' : ''}`}
            onClick={() => handleModeChange('final')}
          >
            Final Scores
          </button>
        </div>

        {appState.gameMode === 'dashboard' && (
          <Dashboard
            teams={appState.teams}
            onTeamsUpdate={handleTeamsUpdate}
          />
        )}

        {appState.gameMode === 'league' && (
          <LeagueMode
            teams={appState.teams}
            league={appState.league}
            onTeamsUpdate={handleTeamsUpdate}
            onLeagueUpdate={handleLeagueUpdate}
          />
        )}



        {appState.gameMode === 'final' && (
          <FinalScore
            teams={appState.teams}
            league={appState.league}
            tournament={appState.tournament}
          />
        )}
      </div>
    </div>
  );
}

export default App;
