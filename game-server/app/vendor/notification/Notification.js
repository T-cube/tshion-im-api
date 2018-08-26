'use strict';

const eventEmitter = require('events');
const AndroidPush = require('ym-android-push');
const apn = require('apn');

const { MiPush, GeTui } = require('./Push');

const jpushConfig = require('../../../config/config').jpush;
let vendor;

/**
 *
 * @param {*} app
 * @returns {Notification}
 */
module.exports = function(app) {
  const Badger = require('../../models/badge')(app);

  const operationMap = new Map();
  const pem_dir = `${__dirname}/../../../pem/apn/`;
  const provider = process.env.NODE_ENV === 'production' ? {
    cert: `${pem_dir}apn-cert.pem`,
    key: `${pem_dir}apn-key.pem`,
    passphrase: '123456'
  } : {
    cert: `${pem_dir}apn-dev-cert.pem`,
    key: `${pem_dir}apn-dev-key.pem`,
    passphrase: '123456'
  };

  const apnService = new apn.Provider(provider);
  const androidPush = new AndroidPush(jpushConfig);



  function Notification() {
    if (!(this instanceof Notification)) return new Notification();
    this.on('finish.notification', this._onFinishNotification.bind(this));
  }

  const prototype = Notification.prototype = new eventEmitter();

  prototype._onFinishNotification = function(uid) {
    let events = operationMap.get(uid);
    events.shift();
    if (events.length) {
      this._doPushNotification.apply(this, events[0]);
    }
  };

  /**
   *
   * @param {String} uid
   */
  prototype._getBadge = function(uid) {
    return Badger.incBadge({ uid }).then(badger => {
      if (!badger) return 0;
      return badger.badge;
    });
  };

  /**
   *
   * @param {String} uid
   * @param {Object} notification
   * @param {Boolean} isBadge
   */
  prototype.pushNotification = function(tokens, notification, isBadge) {
    let { uid } = notification;
    let events = operationMap.get(uid) || [];
    events.push(arguments);
    operationMap.set(uid, events);

    if (events.length == 1) {
      return this._doPushNotification.apply(this, arguments);
    }
  };

  prototype._doPushNotification = function(tokens, notification, isBadge) {
    if (isBadge) {
      let { uid } = notification;
      return this._getBadge(uid).then(badge => {
        notification.badge = badge;
        return this._pushNotification(tokens, notification);
      });
    } else
      return this._pushNotification(tokens, notification);
  };

  prototype._pushNotification = function(tokens, notification) {
    let iosTokens = [],
      xiaomiTokens = [],
      androidTokens = [];
    let { uid } = notification;
    for (let token of tokens) {
      let { client, deviceToken, brand } = token;
      if (client == 'ios') iosTokens.push(deviceToken);
      else if (brand == 'xiaomi') xiaomiTokens.push(deviceToken);
      else androidTokens.push(deviceToken);
    }

    let { content } = notification;
    content = content.replace(/&nbsp;/g, ' ');
    if (content.length > 70) content = content.substr(0, 67) + '...';
    notification.content = content;

    return Promise.all([
      new Promise((resolve, reject) => {
        if (iosTokens.length) {
          let message = this._generateMessageIOS(notification);

          apnService.send(message, iosTokens).then(result => {
            // console.log('.................:', result);
            console.log('sent:', result.sent.length);
            console.log('failed:', result.failed.length, result.failed);
            // console.log(result.failed);
            resolve(result);
          });
        } else resolve(null);
      }),
      new Promise((resolve, reject) => {
        if (androidTokens.length) {
          // console.log(notification);
          // console.log('androidTokens:--------', androidTokens);
          return resolve(GeTui.sendToRegId(androidTokens, notification));
        } else resolve(null);
      }),
      new Promise((resolve, reject) => {
        if (xiaomiTokens.length) {
          let ns = this._generateMessageAndroid(notification);
          // console.log('androidTokens:--------', xiaomiTokens);
          // console.log('.......ns', ns);
          // let message = {
          //   msg_content: ns.alert,
          //   title: ns.title,
          //   content_type: 'text',
          //   extras: ns.extras
          // };

          return MiPush.sendToRegId(xiaomiTokens, ns)
            //     androidPush.push({
            //       platform: 'android',
            //       audience: {
            //         registration_id: androidTokens
            //       },
            //       notification: ns,
            //       message,
            //       options: {
            //         time_to_live: 60,
            //         // apn_production: false
            //       }
            //     })
            .then(r => {
              // console.log('android sent:', r);
              resolve(r);
            }).catch(reject);
        } else resolve(null);
      })
    ]).then(() => {
      // console.log('push done -----------------');
      return this._emitNextNotification(uid);
    }).catch(error => {
      // console.error(error);
      return this._emitNextNotification(uid);
    });
  };

  prototype._emitNextNotification = function(uid) {
    return this.emit('finish.notification', uid);
  };

  prototype._generateMessageIOS = function(msg) {
    let { content, from, roomid, type, badge = 0, from_name } = msg;

    let data = {
      sound: 'ping.aiff',
      alert: {
        title: from_name || 'Tillo',
        body: content
      },
      payload: {
        sender: from,
        roomid,
        type
      }
    };

    if (!isNaN(badge)) data.badge = badge;
    let notification = new apn.Notification(data);
    notification.topic = 'com.beiyou.beichat';

    return notification;
  };

  prototype._generateMessageAndroid = function(msg) {
    let { content, from, roomid, type, badge = 0, from_name } = msg;

    let notification = {
      alert: content,
      title: from_name || 'Tillo',
      builder_id: 0,
      priority: 2,
      extras: {
        sender: from,
        roomid,
        type,
        badge
      }
    };

    return notification;
  };

  if (!vendor) {
    vendor = new Notification();
  }

  return vendor;
};
