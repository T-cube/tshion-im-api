var _ = require('../libs/util');
module.exports = {
  mongodb: {
    host: '127.0.0.1',
    port: 27017,
    db: process.env.NODE_ENV == 'production' ? 'tim_test' : 'tim_test'
  },
  mysql: {
    host: process.env.NODE_ENV === 'production' ? '192.168.1.83' : '127.0.0.1',
    port: 3306,
    user: 'root',
    password: process.env.NODE_ENV === 'production' ? '123456' : '',
    database: 'tlifang_v2'
  },
  channel: {
    numbers: 5,
  },
  redis: [
    {host: "127.0.0.1", db: 7, prefix: 'online',},
    {host: "127.0.0.1", prefix: 'msg'},
    {host: "127.0.0.1", prefix: 'token'},
    {host: "127.0.0.1", prefix: ''}//java服务器redis，没有前缀
  ],
  file: {
    allowTypes: /\.(jpg|jpeg|bmp|png|zip|aac|wav|doc|docx|ppt|pptx|xls|xlsx|pdf|txt)$/i,
    maxSize: 5 * _.mb
  },
  getui: {
    appid: '',
    appsecret: '',
    appkey: '',
    mastersecret: ''
  },
  qiniu: {
    ACCESS_KEY: '',
    SECRET_KEY: '',
    BUCKET: '',
    SERVER_URL: ''
  },
  rpc: {
    host: '127.0.0.1',
    port: '2001',
    register: {
      protocol: 'http',
      // hostname: 'tlifang.com',
      hostname: '127.0.0.1',
      // hostname: '192.168.1.18',
      // hostname: '192.168.1.22',
      port: 3333,
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
      },
      'tlf-api-zero': {
        appsecret: 'iJeBxYtE78PgiV12',
        appid: 'tlf-api-zero'
      }
    }
  },
  mipush: {
    appSecret: 'bf6pJcMhaLXxLOlYgzosyg=='
  },
  jpush: {
    appkey: '',
    masterkey: ''
  }
};
