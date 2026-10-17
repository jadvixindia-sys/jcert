/**
 * PM2 process definitions for the Jadvix Certificate Portal.
 * Run both apps with:  pm2 start ecosystem.config.js
 *
 * Prerequisites (once, on the server):
 *   cd backend  && npm ci && npm run build
 *   cd frontend && npm ci && npm run build
 */
module.exports = {
  apps: [
    {
      name: 'jadvix-api',
      cwd: './backend',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'jadvix-web',
      cwd: './frontend',
      // Runs `next start` on port 3000 from the production build.
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
