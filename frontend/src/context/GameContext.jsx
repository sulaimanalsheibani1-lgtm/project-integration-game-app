import React, { createContext, useContext, useReducer } from 'react';

// Game context
const GameContext = createContext();

// Game actions
const GAME_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CURRENT_GAME: 'SET_CURRENT_GAME',
  SET_GAME_LIST: 'SET_GAME_LIST',
  SET_CURRENT_TEAM: 'SET_CURRENT_TEAM',
  UPDATE_GAME_STATE: 'UPDATE_GAME_STATE',
  ADD_TIMELINE_EVENT: 'ADD_TIMELINE_EVENT',
  UPDATE_TEAM_DATA: 'UPDATE_TEAM_DATA',
  SET_CONNECTED_PLAYERS: 'SET_CONNECTED_PLAYERS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_GAME: 'RESET_GAME'
};

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case GAME_ACTIONS.SET_CURRENT_GAME:
      return {
        ...state,
        currentGame: action.payload,
        loading: false,
        error: null
      };
    case GAME_ACTIONS.SET_GAME_LIST:
      return {
        ...state,
        gameList: action.payload,
        loading: false
      };
    case GAME_ACTIONS.SET_CURRENT_TEAM:
      return {
        ...state,
        currentTeam: action.payload
      };
    case GAME_ACTIONS.UPDATE_GAME_STATE:
      return {
        ...state,
        currentGame: state.currentGame ? {
          ...state.currentGame,
          gameState: { ...state.currentGame.gameState, ...action.payload }
        } : null
      };
    case GAME_ACTIONS.ADD_TIMELINE_EVENT:
      return {
        ...state,
        currentGame: state.currentGame ? {
          ...state.currentGame,
          timeline: [...(state.currentGame.timeline || []), action.payload]
        } : null
      };
    case GAME_ACTIONS.UPDATE_TEAM_DATA:
      return {
        ...state,
        currentTeam: state.currentTeam ? {
          ...state.currentTeam,
          ...action.payload
        } : null
      };
    case GAME_ACTIONS.SET_CONNECTED_PLAYERS:
      return {
        ...state,
        connectedPlayers: action.payload
      };
    case GAME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case GAME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case GAME_ACTIONS.RESET_GAME:
      return {
        ...initialState,
        gameList: state.gameList
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  currentGame: null,
  currentTeam: null,
  gameList: [],
  connectedPlayers: [],
  loading: false,
  error: null,
  socket: null
};

// Game provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Set loading state
  const setLoading = (loading) => {
    dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: loading });
  };

  // Set current game
  const setCurrentGame = (game) => {
    dispatch({ type: GAME_ACTIONS.SET_CURRENT_GAME, payload: game });
  };

  // Set game list
  const setGameList = (games) => {
    dispatch({ type: GAME_ACTIONS.SET_GAME_LIST, payload: games });
  };

  // Set current team
  const setCurrentTeam = (team) => {
    dispatch({ type: GAME_ACTIONS.SET_CURRENT_TEAM, payload: team });
  };

  // Update game state
  const updateGameState = (stateUpdates) => {
    dispatch({ type: GAME_ACTIONS.UPDATE_GAME_STATE, payload: stateUpdates });
  };

  // Add timeline event
  const addTimelineEvent = (event) => {
    dispatch({ type: GAME_ACTIONS.ADD_TIMELINE_EVENT, payload: event });
  };

  // Update team data
  const updateTeamData = (teamUpdates) => {
    dispatch({ type: GAME_ACTIONS.UPDATE_TEAM_DATA, payload: teamUpdates });
  };

  // Set connected players
  const setConnectedPlayers = (players) => {
    dispatch({ type: GAME_ACTIONS.SET_CONNECTED_PLAYERS, payload: players });
  };

  // Set error
  const setError = (error) => {
    dispatch({ type: GAME_ACTIONS.SET_ERROR, payload: error });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: GAME_ACTIONS.CLEAR_ERROR });
  };

  // Reset game state
  const resetGame = () => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  };

  // Game phase helpers
  const isGamePhase = (phase) => {
    return state.currentGame?.phase === phase;
  };

  const canMakeDecision = () => {
    return state.currentGame?.status === 'in-progress' && 
           state.currentTeam?.status === 'active';
  };

  // Team role helpers
  const isTeamLeader = (userId) => {
    if (!state.currentTeam || !userId) return false;
    const member = state.currentTeam.members?.find(m => m.userId === userId);
    return member?.role === 'leader';
  };

  const getTeamMember = (userId) => {
    if (!state.currentTeam || !userId) return null;
    return state.currentTeam.members?.find(m => m.userId === userId);
  };

  // Game statistics
  const getGameProgress = () => {
    if (!state.currentGame) return 0;
    
    const currentRound = state.currentGame.gameState?.currentRound || 1;
    const totalRounds = state.currentGame.gameState?.totalRounds || 5;
    
    return Math.round((currentRound / totalRounds) * 100);
  };

  const getBudgetUtilization = () => {
    if (!state.currentTeam) return 0;
    
    const budget = state.currentTeam.gameData?.budget;
    if (!budget || budget.total === 0) return 0;
    
    return Math.round((budget.spent / budget.total) * 100);
  };

  // Context value
  const value = {
    ...state,
    setLoading,
    setCurrentGame,
    setGameList,
    setCurrentTeam,
    updateGameState,
    addTimelineEvent,
    updateTeamData,
    setConnectedPlayers,
    setError,
    clearError,
    resetGame,
    isGamePhase,
    canMakeDecision,
    isTeamLeader,
    getTeamMember,
    getGameProgress,
    getBudgetUtilization
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};

export default GameContext;