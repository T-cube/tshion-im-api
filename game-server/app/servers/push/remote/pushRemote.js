'use strict';

const apn = require('apn');
const AndroidPush = require('@ym/android-push');
const config = require('../../../../config/config');


module.exports = function(app) {
  return new PushRemote(app);
};

const PushRemote = function(app) {
  this.app = app;
  let { NODE_ENV } = process.env;

  let provider = NODE_ENV === 'production' ? {
    cert: `${__dirname}/../../../../apn-cert.pem`,
    key: `${__dirname}/../../../../apn-key.pem`,
    passphrase: '19491001'
  } : {
    cert: `${__dirname}/../../../../apn-dev-cert.pem`,
    key: `${__dirname}/../../../../apn-dev-key.pem`,
    passphrase: '19491001'
  };

  this.apnService = new apn.Provider(provider);

  this.androidPush = new AndroidPush(config.jpush);
};

const prototype = PushRemote.prototype;

prototype.generatePushMessageIOS = function(msg) {
  let { content, from, roomid, type } = msg;
  content = content.replace(/&nbsp;/g, ' ');
  if (content.length > 70) content = content.substr(0, 67) + '...';
  let notification = new apn.Notification({
    sound: 'ping.aiff',
    alert: content,
    badge: 0,
    payload: {
      sender: from,
      roomid,
      type
    }
  });
  notification.topic = 'com.tlfapp';
  return notification;
};

prototype.generatePushMessageAndroid = function(msg) {
  let { content, from, roomid, type } = msg;
  content = content.replace(/&nbsp;/g, ' ');
  if (content.length > 70) content = content.substr(0, 67) + '...';
  let notification = {
    alert: content,
    title: 'Tlifang',
    builder_id: 0,
    extras: {
      sender: from,
      roomid,
      type
    }
  };
  return notification;
};

prototype.pushMessageOne = function(msg, cb) {
  let self = this;
  let { target: uid } = msg;
  self.app.rpc.account.accountRemote.getDeviceToken(null, { uid }, function(err, tokens = []) {
    console.log(arguments, '........', tokens, msg);
    if (err || !tokens.length) return console.error(err);

    let iosTokens = [],
      androidTokens = [];

    tokens.forEach(token => {
      let { client, deviceToken } = token;
      client === 'ios' && iosTokens.push(deviceToken);
      client === 'android' && androidTokens.push(deviceToken);
    });

    if (iosTokens.length) {
      let message = self.generatePushMessageIOS(msg);
      console.log(message, iosTokens, 'hihihihihihihihi');
      self.apnService.send(message, iosTokens).then(result => {
        console.log('sent:', result.sent.length);
        console.log('failed:', result.failed.length);
        console.log(result.failed);
      });
    }

    if (androidTokens.length) {
      let notification = self.generatePushMessageAndroid(msg);
      console.log('.........', androidTokens, notification);
      let message = {
        msg_content: notification.alert,
        title: notification.title,
        content_type: 'text',
        extras: notification.extras
      };
      self.androidPush.push({
        platform: 'android',
        'audience': {
          'registration_id': androidTokens
        },
        notification,
        message,
        'options': {
          'time_to_live': 60,
          'apns_production': false
        }
      }).then(r =>
        console.log(1, r)
      ).catch(e =>
        console.log(2, e));
    }
  });
};
