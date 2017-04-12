module.exports = {
  mongodb: {
    host: '127.0.0.1',
    port: 27017,
    db: process.env.NODE_ENV == 'production' ? 'tim' : 'tim_test'
  },
  redis: [
    { db: 7, prefix: 'online' },
    { prefix: 'msg' },
    { prefix: 'token' }
  ],
  rpc: {
    host: '127.0.0.1',
    port: '2001',
    register: {
      protocol: 'http',
      hostname: '127.0.0.1',
      // hostname: '192.168.1.22',
      port: 3000,
      appid: 'tim',
      appsecret: 'S7B6881J8nRRqCjG',
    },
    users: {
      'xuezi': {
        appsecret: '123456',
        appid: 'xuezi'
      },
      'mayi': {
        appid: 'mayi',
        appsecret: 'Rneo8P6P09u4ZfdZ'
      },
      'gea': {
        appid: 'gea',
        appsecret: 'BRQyDM4Jq89XbDrJ'
      },
      'tlf-api': {
        appsecret: 'gvldWZTnQ8BIAReK',
        appid: 'tlf-api'
      }
    }
  },
};