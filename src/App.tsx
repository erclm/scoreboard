import React, { useState, useEffect, useRef } from 'react';
import { AppState, GameMode, Team, League } from './types';
import { saveData, loadData, exportData, importData, checkStorageHealth } from './utils/storage';
import Dashboard from './components/Dashboard';
import LeagueMode from './components/LeagueMode';
import ManualStats from './components/ManualStats';
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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check storage health on startup
    const healthCheck = checkStorageHealth();
    if (!healthCheck.available) {
      alert('⚠️ Storage not available! Data won\'t persist. Try enabling cookies/storage or disable incognito mode.');
    }
    
    const savedData = loadData();
    if (savedData) {
      setAppState(savedData);
    }
  }, []);

  useEffect(() => {
    setSaveStatus('saving');
    const success = saveData(appState);
    setSaveStatus(success ? 'saved' : 'error');
    
    if (!success) {
      console.error('⚠️ Auto-save failed! Consider exporting your data.');
    }
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <h1 className="arcade-text" style={{ fontSize: '56px', marginBottom: '20px', letterSpacing: '4px' }}>
              ⭐ SCOREBOARD ⭐
            </h1>
            <div className="save-status" style={{ 
              fontSize: '14px', 
              padding: '4px 8px', 
              borderRadius: '4px',
              backgroundColor: saveStatus === 'saved' ? '#00ff80' : saveStatus === 'saving' ? '#ffaa00' : '#ff4040',
              color: '#000'
            }}>
              {saveStatus === 'saved' ? '✅ Saved' : saveStatus === 'saving' ? '💾 Saving...' : '❌ Save Failed'}
            </div>
          </div>
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
            className={`retro-button mode-button ${appState.gameMode === 'manual-stats' ? 'active' : ''}`}
            onClick={() => handleModeChange('manual-stats')}
          >
            Manual Stats
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

        {appState.gameMode === 'manual-stats' && (
          <ManualStats
            teams={appState.teams}
            onTeamsUpdate={handleTeamsUpdate}
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
