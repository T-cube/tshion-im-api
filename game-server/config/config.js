var path = require('path');
var is_dev = process.env.NODE_ENV == 'development';
module.exports = {
  mongodb: {
    host: '127.0.0.1',
    port: 27017,
    db: process.env.NODE_ENV == 'production' ? 'tim_test' : 'tim_test'
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
      // hostname: 'tlifang.com',
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
  jpush: {
    appkey: 'd7f9bbd0030efabfc39a1c45',
    masterkey: '73da1312e0e007e9af403c4d'
  }
};