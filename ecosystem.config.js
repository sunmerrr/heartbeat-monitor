module.exports = {
  apps : [{
    name: "프/heartbeat-monitor",
    script: "npm",
    args: "run dev",
    cwd: "./frontend",
    watch: false,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }, {
    name: "백/heartbeat-monitor",
    script: "npm",
    args: "start",
    cwd: "./backend",
    watch: false,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};