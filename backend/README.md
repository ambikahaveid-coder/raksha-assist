# Raksha Assist - Backend Package

## Overview
Node.js/Express backend API for Raksha Assist emergency medical assistance platform.

## Prerequisites
- Node.js 18+ (recommended: 20)
- PostgreSQL 14+ (Supabase recommended)
- npm or yarn

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update these required values in `.env`:
   - `DATABASE_URL` - Your Supabase PostgreSQL connection string
   - `SESSION_SECRET` - Any 32+ character random string
   - `FRONTEND_URL` - http://localhost:3000 for local dev

3. **Push database schema:**
   ```bash
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

## Production Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Start server:**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| SESSION_SECRET | Yes | Random string (32+ chars) for session encryption |
| FRONTEND_URL | Yes | Frontend domain for CORS |
| PORT | No | Server port (default: 5000) |
| OPENAI_API_KEY | Yes | For voice assistant TTS/STT |
| RAZORPAY_KEY_ID | Yes | Razorpay API Key |
| RAZORPAY_KEY_SECRET | Yes | Razorpay Secret |

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start dist/index.cjs --name "raksha-backend"
pm2 save
pm2 startup
```

### Using systemd
```ini
[Unit]
Description=Raksha Assist Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/raksha-backend
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/staff-login` - Staff email/password login
- `GET /api/auth/me` - Get current user

### Plans & FAQs
- `GET /api/plans` - List all plans
- `GET /api/faqs` - List FAQs

### Voice API
- `POST /api/voice/chat` - Chat with Raksha AI
- `POST /api/voice/speak` - Text-to-Speech
- `POST /api/voice/listen` - Speech-to-Text
- `GET /api/voice/languages` - Supported languages

### Payments
- `POST /api/razorpay/create-order` - Create payment order
- `POST /api/razorpay/webhook` - Razorpay webhook

## Security Notes
- Uses Helmet for security headers
- Rate limiting enabled (100 req/min global)
- CSRF protection with double-submit cookies
- Sessions stored in PostgreSQL
- All passwords hashed with bcrypt
