const appDir = process.env.APP_DIR || "/var/www/my-plan-project";
const appPort = process.env.APP_PORT || "4010";

module.exports = {
  apps: [
    {
      name: "my-plan-project",
      cwd: `${appDir}/current`,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${appPort}`,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: appPort,
      },
      error_file: `${appDir}/shared/logs/error.log`,
      out_file: `${appDir}/shared/logs/out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
