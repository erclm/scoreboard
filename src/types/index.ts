export interface Team {
  id: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface Game {
  id: string;
  team1Id: string;
  team2Id: string;
  result?: 'team1' | 'team2' | 'draw';
  completed: boolean;
}

export interface Round {
  id: string;
  roundNumber: number;
  games: Game[];
  completed: boolean;
}

export interface League {
  id: string;
  name: string;
  teams: Team[];
  rounds: Round[];
  currentRound: number;
  completed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  currentGameIndex: number;
  games: Game[];
  completed: boolean;
}

export type GameMode = 'dashboard' | 'league' | 'tournament' | 'final' | 'manual-stats';

export interface AppState {
  gameMode: GameMode;
  teams: Team[];
  league?: League;
  tournament?: Tournament;
}
