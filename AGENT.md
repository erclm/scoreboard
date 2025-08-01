# Scoreboard Application - Agent Guide

## Project Overview
A React-based scoreboard webapp designed for team games, optimized for widescreen projector display. Features retro arcade styling with multiple game modes including dashboard scoring, league management, tournament bracket system, and final score display.

## Tech Stack
- **Frontend**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 5.0.8
- **Styling**: CSS with retro arcade theme
- **Data Persistence**: localStorage with JSON export/import
- **Development**: ESLint for code quality

## Commands

### Development
```bash
npm run dev          # Start development server (Vite)
npm run build        # TypeScript compilation + production build
npm run preview      # Preview production build
npm run lint         # Run ESLint with TypeScript rules
```

### Testing & Quality
```bash
npm run build        # Verify TypeScript compilation and build
npm run lint         # Check code quality and TypeScript errors
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main scoring interface with team management
│   ├── LeagueMode.tsx   # League management with split-screen layout
│   ├── FinalScore.tsx   # Results and standings display
│   └── TournamentMode.tsx # 4-team tournament bracket system
├── types/               # TypeScript interfaces
│   └── index.ts        # Team, League, Game, Tournament type definitions
├── utils/               # Utility functions
│   └── storage.ts      # localStorage operations + JSON export/import
├── styles/              # CSS styling
│   └── App.css         # Main stylesheet with retro arcade theme
├── constants.ts         # Global constants (TEAM_COUNT = 8)
├── main.tsx            # React app entry point
└── App.tsx             # Main application component with mode switching
```

## Key Features

### Main Dashboard
- Grant/deduct points (+1, +10, -1, -10)
- Set specific point values
- Edit team names (click to edit)
- Real-time team rankings
- Reset all scores functionality

### League Mode
- 8 teams with automatic round-robin scheduling
- 4 simultaneous games per round (7 rounds total)
- W-L-D scoring system (3 pts win, 1 pt draw, 0 pts loss)
- Split-screen layout: games on left, live standings on right
- Real-time standings updates with top 3 highlighting
- League points automatically sync to main dashboard scores

### Data Management
- Auto-save to localStorage
- Export data to JSON file
- Import data from JSON file
- Reset all data option

## Design Principles

### Projector Optimization
- **Target**: Widescreen projectors (16:9, 21:9 aspect ratios)
- **Viewing distance**: 10+ feet
- **Text sizes**: 18px+ for body text, 28px+ for important content
- **Button sizes**: Minimum 80px width, 70px height
- **High contrast**: Dark backgrounds with bright text
- **Large click targets**: Easy operation from distance

### Typography
- **Headers**: Press Start 2P (retro arcade font)
- **Body text**: Space Mono (readable monospace)
- **Minimum sizes**: 16px body, 20px+ for important content

### Color Scheme
- **Primary**: Bright cyan (#00c8ff) for main elements
- **Accent**: Hot pink (#ff0080) for highlights
- **Success**: Bright green (#00ff80) for positive actions
- **Warning**: Orange (#ffaa00) for neutral actions
- **Background**: Deep space blues (#001133, #000819)
- **Text**: White (#ffffff) for maximum contrast

### Layout Patterns
- **Split-screen**: League mode uses 60/40 split (games/standings)
- **Grid layouts**: 2-column for games, responsive breakpoints
- **Card-based**: Containers with rounded corners and shadows
- **Sticky elements**: Standings sidebar stays in view

## Code Conventions

### Component Structure
- Functional components with TypeScript
- Props interfaces defined inline or in types/
- Event handlers prefixed with `handle` (e.g., `handleTeamsUpdate`)
- CSS classes use kebab-case with semantic names

### Styling
- CSS-in-JS for component-specific overrides
- Global styles in App.css
- Responsive breakpoints: 1200px, 1400px, 1600px
- Animation durations: 0.2s for interactions, 0.4s for transitions

### State Management
- React useState for local component state
- Props drilling for parent-child communication
- localStorage for data persistence
- Auto-save on every state change

## Responsive Breakpoints

```css
/* Large projectors/displays */
@media (min-width: 1600px) {
  .league-split-layout { grid-template-columns: 1fr 600px; }
}

/* Standard widescreen */
@media (max-width: 1600px) {
  .league-split-layout { grid-template-columns: 1fr 500px; }
}

/* Compact widescreen */
@media (max-width: 1400px) {
  .league-split-layout { grid-template-columns: 1fr 450px; }
}

/* Tablet/mobile */
@media (max-width: 1200px) {
  .league-split-layout { grid-template-columns: 1fr; }
}
```

## Game Logic

### League Scoring
- **Win**: 3 points
- **Draw**: 1 point  
- **Loss**: 0 points
- **Standings**: Sorted by points, then goal difference (wins - losses)
- **League points automatically added to main dashboard scores**

### Team Management
- 8 teams initialized as "Team 1" through "Team 8"
- Team names editable in Dashboard mode
- Team data persists across all modes
- W/L/D stats reset when league resets, points remain

## Performance Notes
- Build output ~160KB JS, ~8KB CSS (gzipped ~50KB JS, ~2KB CSS)
- No external dependencies beyond React ecosystem
- Optimized for offline use
- Fast rendering with minimal re-renders

### Tournament Mode
- 4-team tournament bracket system
- Semi-finals followed by final match
- Knockout format with winner progression
- Team selection from available 8-team roster
- Bracket visualization with match results

## Future Enhancements
- Audio feedback for score changes
- Keyboard shortcuts for common actions
- Team logos/colors support
- Multiple simultaneous leagues
- Third-place playoff in tournaments
