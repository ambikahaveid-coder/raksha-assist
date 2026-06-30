# Raksha Assist - Frontend Package

## Overview
React-based frontend for Raksha Assist emergency medical assistance platform.

## Prerequisites
- Node.js 18+ (recommended: 20)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with static files.

4. **Deploy:**
   Upload the `dist/` folder to any static hosting:
   - AWS S3 + CloudFront
   - Nginx
   - Apache
   - Netlify
   - Vercel

## Static Hosting Configuration

### Nginx
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/raksha-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Build Output
After running `npm run build`:
- `dist/index.html` - Main entry point
- `dist/assets/` - JavaScript, CSS, and images

**Note**: The source code (client/src/) is included for reference. 
For deployment, only the `dist/` folder is needed after building.

## Notes
- All API calls go to `VITE_API_BASE_URL`
- Uses client-side routing (requires SPA fallback config)
- Supports 9 Indian languages for voice assistant
- Build locally, then deploy only the `dist/` folder to CDN
