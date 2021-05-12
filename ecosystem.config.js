module.exports = {
  apps: [
    {
      name: "Node-Server",
      script: "./src/index.js",
      watch: true,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
