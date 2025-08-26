# Project Integration Game API Documentation

## Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-api-domain.com/api`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric, _, -)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "firstName": "string (1-50 chars)",
  "lastName": "string (1-50 chars)",
  "role": "string (optional: 'student', 'instructor', 'admin')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "firstName": "First",
      "lastName": "Last",
      "fullName": "First Last",
      "role": "student",
      "avatar": null
    }
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "login": "string (email or username)",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "firstName": "First",
      "lastName": "Last",
      "fullName": "First Last",
      "role": "student",
      "avatar": null,
      "gameStats": {
        "gamesPlayed": 0,
        "totalScore": 0,
        "averageScore": 0,
        "achievements": [],
        "favoritesScenarios": []
      },
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "firstName": "First",
    "lastName": "Last",
    "role": "student",
    "gameStats": { ... },
    "preferences": { ... }
  }
}
```

### Logout
**POST** `/auth/logout`

Logout user (client-side token removal).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Game Endpoints

### Get Games
**GET** `/games`

Retrieve list of games.

**Query Parameters:**
- `status` (optional): Filter by status (`waiting`, `in-progress`, `completed`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "game_id",
        "title": "Game Title",
        "scenarioId": "scenario_id",
        "hostId": "host_id",
        "status": "waiting",
        "phase": "setup",
        "teams": ["team_id_1", "team_id_2"],
        "maxTeams": 4,
        "maxPlayersPerTeam": 4,
        "settings": {
          "duration": 60,
          "difficulty": "medium"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalGames": 50
    }
  }
}
```

### Create Game
**POST** `/games`

Create a new game session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string (required)",
  "scenarioId": "string (required)",
  "maxTeams": "number (1-8, default: 4)",
  "maxPlayersPerTeam": "number (1-6, default: 4)",
  "settings": {
    "duration": "number (15-300, default: 60)",
    "difficulty": "string ('easy', 'medium', 'hard')",
    "allowSpectators": "boolean (default: true)",
    "disruptionFrequency": "string ('low', 'medium', 'high')"
  },
  "isPrivate": "boolean (default: false)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game created successfully",
  "data": {
    "game": {
      "id": "game_id",
      "title": "Game Title",
      "scenarioId": "scenario_id",
      "hostId": "host_id",
      "status": "waiting",
      "inviteCode": "ABC123",
      // ... other game data
    }
  }
}
```

### Get Game Details
**GET** `/games/:id`

Get detailed information about a specific game.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": "game_id",
      "title": "Game Title",
      "scenario": {
        "id": "scenario_id",
        "title": "Scenario Title",
        "description": "Scenario description",
        // ... scenario details
      },
      "teams": [
        {
          "id": "team_id",
          "name": "Team Name",
          "members": [
            {
              "userId": "user_id",
              "role": "leader",
              "user": {
                "firstName": "John",
                "lastName": "Doe"
              }
            }
          ],
          "score": {
            "current": 85,
            "breakdown": {
              "budget": 20,
              "timeline": 25,
              "quality": 20,
              "teamwork": 15,
              "crisis": 5
            }
          }
        }
      ],
      "gameState": {
        "currentRound": 2,
        "totalRounds": 5,
        "roundTimeRemaining": 1800
      },
      "timeline": [
        {
          "timestamp": "2024-01-01T10:00:00.000Z",
          "event": "Game started",
          "details": {},
          "teamId": null,
          "userId": "host_id"
        }
      ]
    }
  }
}
```

### Join Game
**POST** `/games/:id/join`

Join a game session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "teamId": "string (optional - join specific team)",
  "inviteCode": "string (required for private games)"
}
```

### Leave Game
**POST** `/games/:id/leave`

Leave a game session.

**Headers:** `Authorization: Bearer <token>`

## Team Endpoints

### Get Teams
**GET** `/teams`

Get teams for current user or specific game.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `gameId` (optional): Filter by game ID

### Create Team
**POST** `/teams`

Create a new team within a game.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required, 1-50 chars)",
  "gameId": "string (required)",
  "color": "string (optional, hex color)",
  "avatar": "string (optional, avatar URL)"
}
```

### Get Team Details
**GET** `/teams/:id`

Get detailed team information.

**Headers:** `Authorization: Bearer <token>`

## Scenario Endpoints

### Get Scenarios
**GET** `/scenarios`

Get available game scenarios.

**Query Parameters:**
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty
- `active` (optional): Filter active scenarios (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "scenario_id",
        "title": "Perfect Wedding Challenge",
        "description": "Plan and execute a memorable wedding...",
        "category": "wedding",
        "difficulty": "medium",
        "estimatedDuration": 60,
        "maxTeams": 4,
        "learningObjectives": [
          "Project Planning and Resource Allocation",
          "Budget Management and Cost Control"
        ],
        "playCount": 125,
        "averageRating": 4.5,
        "ratingsCount": 23
      }
    ]
  }
}
```

### Get Scenario Details
**GET** `/scenarios/:id`

Get detailed scenario information including game rules, disruption cards, and resources.

## User Endpoints

### Get User Profile
**GET** `/users/:id`

Get user profile information.

**Headers:** `Authorization: Bearer <token>`

### Update User Profile
**PUT** `/users/:id`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "avatar": "string (optional)",
  "profile": {
    "bio": "string (optional, max 500 chars)",
    "organization": "string (optional, max 100 chars)",
    "level": "string (optional: 'beginner', 'intermediate', 'advanced')"
  },
  "preferences": {
    "notifications": {
      "email": "boolean",
      "push": "boolean",
      "gameInvites": "boolean"
    },
    "privacy": {
      "showProfile": "boolean",
      "showStats": "boolean"
    }
  }
}
```

## Leaderboard Endpoints

### Get Global Leaderboard
**GET** `/leaderboards`

Get global player rankings.

**Query Parameters:**
- `period` (optional): `all-time`, `month`, `week` (default: `all-time`)
- `limit` (optional): Number of results (default: 10, max: 100)

### Get Scenario Leaderboard
**GET** `/leaderboards/scenario/:scenarioId`

Get leaderboard for specific scenario.

## WebSocket Events

The application uses Socket.IO for real-time communication.

### Client Events (Emit)

#### authenticate
Authenticate socket connection.
```javascript
socket.emit('authenticate', {
  userId: 'user_id',
  gameId: 'game_id'
});
```

#### game-action
Send game action to other players.
```javascript
socket.emit('game-action', {
  action: 'decision-made',
  payload: {
    decisionId: 'budget_allocation',
    choice: 'balanced'
  }
});
```

#### team-message
Send message to team members.
```javascript
socket.emit('team-message', {
  teamId: 'team_id',
  message: 'Let\'s allocate more budget to catering',
  type: 'chat'
});
```

### Server Events (Listen)

#### authenticated
Confirmation of successful authentication.
```javascript
socket.on('authenticated', (data) => {
  console.log('Connected to game:', data.gameId);
});
```

#### game-update
Real-time game state updates.
```javascript
socket.on('game-update', (data) => {
  console.log('Game action:', data.action);
  console.log('From player:', data.playerId);
});
```

#### team-update
Team-specific updates.
```javascript
socket.on('team-update', (data) => {
  if (data.type === 'message') {
    console.log('New team message:', data.data.message);
  }
});
```

#### disruption-card
Disruption card triggered.
```javascript
socket.on('disruption-card', (data) => {
  console.log('Disruption triggered:', data.cardId);
});
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- Default: 100 requests per 15-minute window per IP
- Authentication endpoints: Additional rate limiting
- WebSocket connections: Connection limits per user

## Data Models

### User Model
```javascript
{
  id: ObjectId,
  username: String (unique),
  email: String (unique),
  firstName: String,
  lastName: String,
  avatar: String,
  role: String ('student', 'instructor', 'admin'),
  gameStats: {
    gamesPlayed: Number,
    totalScore: Number,
    averageScore: Number,
    achievements: Array,
    favoritesScenarios: Array
  },
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Game Model
```javascript
{
  id: ObjectId,
  title: String,
  scenarioId: ObjectId,
  hostId: ObjectId,
  teams: [ObjectId],
  status: String,
  phase: String,
  settings: Object,
  gameState: Object,
  disruptionCards: Array,
  timeline: Array,
  results: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Team Model
```javascript
{
  id: ObjectId,
  name: String,
  gameId: ObjectId,
  members: Array,
  gameData: {
    budget: Object,
    timeline: Object,
    resources: Array,
    decisions: Array,
    disruptions: Array
  },
  score: Object,
  communication: Array,
  createdAt: Date,
  updatedAt: Date
}
```