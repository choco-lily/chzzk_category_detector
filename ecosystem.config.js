module.exports = {
  apps: [
    {
      name: 'chzzk-category-detector',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        RUN_ONCE: 'false',
        CHECK_INTERVAL: '60000' // 1분 주기로 감지
      }
    },
    {
      name: 'chzzk-channel-search',
      script: 'channel_search.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        RUN_ONCE: 'false',
        CHECK_INTERVAL: '60000' // 서버 감지도 1분 주기로 설정
      }
    }
  ]
};
