require('dotenv').config(); // Add at the top

module.exports = {
  apps: [
    {
      name: "jobsync",
      script: "npm",
      args: "start",
      cwd: "./",
      instances: 1, // Use 1 for development, or "max" for production to use all CPU cores
      exec_mode: "fork", // Use "cluster" mode if instances > 1
      watch: false, // Set to true for development auto-reload
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true, // Prepend timestamp to logs
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
    },
  ],

//   deploy: {
//     production: {
//       user: "deploy",
//       host: ["your-server.com"],
//       ref: "origin/main",
//       repo: "git@github.com:yourusername/jobsync.git",
//       path: "/var/www/jobsync",
//       "pre-deploy-local": "",
//       "post-deploy":
//         "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
//       "pre-setup": "",
//       ssh_options: "StrictHostKeyChecking=no",
//     },
//     staging: {
//       user: "deploy",
//       host: ["staging-server.com"],
//       ref: "origin/develop",
//       repo: "git@github.com:yourusername/jobsync.git",
//       path: "/var/www/jobsync-staging",
//       "post-deploy":
//         "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
//       ssh_options: "StrictHostKeyChecking=no",
//     },
//   },
};

