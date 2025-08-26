# Deployment Configuration

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-integration-game
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_SOCKET_URL=https://your-backend-api.com
```

## Platform Deployment

### Heroku (Backend)

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Create Heroku App**
```bash
cd backend
heroku create your-app-name-api
```

3. **Configure Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set JWT_EXPIRE=7d
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

5. **Heroku Procfile** (backend/Procfile)
```
web: node src/index.js
```

### Vercel (Frontend)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Configure Environment Variables in Vercel Dashboard**
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

### Railway (Alternative)

1. **Connect GitHub Repository**
2. **Set Environment Variables**
3. **Deploy automatically on push**

### MongoDB Atlas Setup

1. **Create Cluster**
2. **Create Database User**
3. **Whitelist IP Addresses (0.0.0.0/0 for production)**
4. **Get Connection String**

## Docker Deployment

### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: project-game-mongo
    restart: always
    environment:
      MONGO_INITDB_DATABASE: project-integration-game
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: project-game-backend
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://mongodb:27017/project-integration-game
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: project-game-frontend
    restart: always
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api
      - VITE_SOCKET_URL=http://localhost:5000

volumes:
  mongodb_data:
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install and Test Backend
      run: |
        cd backend
        npm ci
        npm run test
        
    - name: Install and Test Frontend
      run: |
        cd frontend
        npm ci
        npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name-api"
        heroku_email: "your-email@example.com"
        appdir: "backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./frontend
```

## Monitoring & Logging

### Production Logging
- Use structured logging (Winston, Pino)
- Implement log aggregation (ELK Stack, Splunk)
- Set up error tracking (Sentry)
- Monitor performance (New Relic, DataDog)

### Health Checks
- API health endpoints
- Database connectivity checks
- Memory and CPU monitoring
- Uptime monitoring

## Security Considerations

### Backend Security
- Rate limiting implemented
- Helmet for security headers
- CORS configuration
- Input validation and sanitization
- JWT token expiration
- Environment variable protection

### Frontend Security
- Environment variable prefixing (VITE_)
- Content Security Policy
- XSS protection
- Secure cookie settings

## Scaling Considerations

### Database
- MongoDB indexes for performance
- Connection pooling
- Read replicas for read-heavy operations

### Backend
- Horizontal scaling with load balancer
- Redis for session storage
- Queue system for background jobs

### Frontend
- CDN for static assets
- Code splitting and lazy loading
- Service worker for caching