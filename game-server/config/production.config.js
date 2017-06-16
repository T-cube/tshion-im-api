var path = require('path');
module.exports = {
  mongodb: {
    host: '127.0.0.1',
    port: 27017,
    db: 'tim'
  },
  redis: [
    { db: 7, prefix: 'online' },
    { prefix: 'msg' },
    { prefix: 'token' }
  ],
  apn: {
    key: path.resolve(__dirname, '..', 'apn-key.pem'),
    pem: path.resolve(__dirname, '..', 'apn-cert.pem'),
    passphrase: 19491001
  },
  rpc: {
    host: '127.0.0.1',
    port: '2001',
    register: {
      protocol: 'http',
      hostname: '192.168.1.1',
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