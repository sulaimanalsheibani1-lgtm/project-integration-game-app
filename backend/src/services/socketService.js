// Socket.io service for real-time game functionality
const gameRooms = new Map(); // Store active game rooms
const userSockets = new Map(); // Store user socket mappings

export const handleSocketConnection = (socket, io) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Handle user authentication for socket
  socket.on('authenticate', (data) => {
    try {
      const { userId, gameId } = data;
      
      // Store user socket mapping
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.gameId = gameId;
      
      // Join game room
      if (gameId) {
        socket.join(`game-${gameId}`);
        
        // Initialize game room if it doesn't exist
        if (!gameRooms.has(gameId)) {
          gameRooms.set(gameId, {
            players: new Set(),
            gameState: {
              phase: 'waiting',
              round: 0,
              timeRemaining: 0
            }
          });
        }
        
        // Add player to game room
        const gameRoom = gameRooms.get(gameId);
        gameRoom.players.add(userId);
        
        socket.emit('authenticated', {
          success: true,
          gameId,
          playersCount: gameRoom.players.size
        });
        
        // Notify other players
        socket.to(`game-${gameId}`).emit('player-joined', {
          userId,
          playersCount: gameRoom.players.size
        });
        
        console.log(`👤 User ${userId} joined game ${gameId}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  // Handle game events
  socket.on('game-action', (data) => {
    try {
      const { action, payload } = data;
      const gameId = socket.gameId;
      
      if (!gameId || !gameRooms.has(gameId)) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      // Broadcast action to all players in the game
      io.to(`game-${gameId}`).emit('game-update', {
        action,
        payload,
        timestamp: new Date().toISOString(),
        playerId: socket.userId
      });
      
      console.log(`🎮 Game action in ${gameId}: ${action}`);
    } catch (error) {
      console.error('Game action error:', error);
      socket.emit('error', { message: 'Game action failed' });
    }
  });

  // Handle team communication
  socket.on('team-message', (data) => {
    try {
      const { teamId, message, type = 'chat' } = data;
      const gameId = socket.gameId;
      
      // Broadcast to team members
      socket.to(`team-${teamId}`).emit('team-update', {
        type: 'message',
        data: {
          message,
          type,
          fromUserId: socket.userId,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`💬 Team message in ${teamId}: ${type}`);
    } catch (error) {
      console.error('Team message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle team decision making
  socket.on('team-decision', (data) => {
    try {
      const { teamId, decision, decisionId } = data;
      
      // Broadcast decision to team members
      socket.to(`team-${teamId}`).emit('team-update', {
        type: 'decision',
        data: {
          decision,
          decisionId,
          madeBy: socket.userId,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`⚡ Team decision in ${teamId}: ${decisionId}`);
    } catch (error) {
      console.error('Team decision error:', error);
      socket.emit('error', { message: 'Failed to process decision' });
    }
  });

  // Handle game state updates
  socket.on('game-state-update', (data) => {
    try {
      const gameId = socket.gameId;
      
      if (!gameId || !gameRooms.has(gameId)) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const gameRoom = gameRooms.get(gameId);
      gameRoom.gameState = { ...gameRoom.gameState, ...data };
      
      // Broadcast updated game state to all players
      io.to(`game-${gameId}`).emit('game-state-changed', {
        gameState: gameRoom.gameState,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔄 Game state updated in ${gameId}`);
    } catch (error) {
      console.error('Game state update error:', error);
      socket.emit('error', { message: 'Failed to update game state' });
    }
  });

  // Handle disruption card events
  socket.on('disruption-triggered', (data) => {
    try {
      const { cardId, affectedTeams } = data;
      const gameId = socket.gameId;
      
      // Broadcast disruption to affected teams
      affectedTeams.forEach(teamId => {
        io.to(`team-${teamId}`).emit('disruption-card', {
          cardId,
          timestamp: new Date().toISOString()
        });
      });
      
      console.log(`💥 Disruption card ${cardId} triggered in ${gameId}`);
    } catch (error) {
      console.error('Disruption card error:', error);
      socket.emit('error', { message: 'Failed to trigger disruption' });
    }
  });

  // Handle joining team room
  socket.on('join-team', (data) => {
    try {
      const { teamId } = data;
      socket.join(`team-${teamId}`);
      socket.teamId = teamId;
      
      socket.emit('team-joined', { teamId });
      console.log(`👥 User ${socket.userId} joined team ${teamId}`);
    } catch (error) {
      console.error('Join team error:', error);
      socket.emit('error', { message: 'Failed to join team' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    try {
      const userId = socket.userId;
      const gameId = socket.gameId;
      
      if (userId) {
        userSockets.delete(userId);
      }
      
      if (gameId && gameRooms.has(gameId)) {
        const gameRoom = gameRooms.get(gameId);
        gameRoom.players.delete(userId);
        
        // Notify other players
        socket.to(`game-${gameId}`).emit('player-left', {
          userId,
          playersCount: gameRoom.players.size
        });
        
        // Clean up empty game rooms
        if (gameRoom.players.size === 0) {
          gameRooms.delete(gameId);
          console.log(`🧹 Cleaned up empty game room ${gameId}`);
        }
      }
      
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
};

// Utility functions for external use
export const getGameRoom = (gameId) => {
  return gameRooms.get(gameId);
};

export const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

export const broadcastToGame = (io, gameId, event, data) => {
  io.to(`game-${gameId}`).emit(event, data);
};

export const broadcastToTeam = (io, teamId, event, data) => {
  io.to(`team-${teamId}`).emit(event, data);
};