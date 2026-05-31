const appRoot = process.env.MYPLAN_ROOT || "/var/www/my-plan-project";
const currentDir = process.env.MYPLAN_CURRENT_DIR || `${appRoot}/current`;
const sharedDir = process.env.MYPLAN_SHARED_DIR || `${appRoot}/shared`;
const appPort = process.env.APP_PORT || "4010";

module.exports = {
  apps: [
    {
      name: "my-plan-project",
      cwd: currentDir,
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
      error_file: `${sharedDir}/logs/error.log`,
      out_file: `${sharedDir}/logs/out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "my-plan-automation",
      cwd: currentDir,
      script: "automation/worker.py",
      interpreter: `${currentDir}/.venv-automation/bin/python`,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "350M",
      env: {
        NODE_ENV: "production",
      },
      error_file: `${sharedDir}/logs/automation-error.log`,
      out_file: `${sharedDir}/logs/automation-out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
