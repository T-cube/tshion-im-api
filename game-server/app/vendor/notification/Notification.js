'use strict';

const eventEmitter = require('events');
const AndroidPush = require('@ym/android-push');
const apn = require('apn');

const jpushConfig = require('../../../config/config').jpush;
let vendor;

/**
 *
 * @param {*} app
 * @returns {Notification}
 */
module.exports = function(app) {
  const BadgeCollection = app.db.collection('notification.badge');

  const operationMap = new Map();
  const pem_dir = `${__dirname}/../../../pem/apn/`;
  const provider = process.env.NODE_ENV === 'production' ? {
    cert: `${pem_dir}apn-cert.pem`,
    key: `${pem_dir}apn-key.pem`,
    passphrase: '19491001'
  } : {
    cert: `${pem_dir}apn-dev-cert.pem`,
    key: `${pem_dir}apn-dev-key.pem`,
    passphrase: '19491001'
  };

  const apnService = new apn.Provider(provider);
  const androidPush = new AndroidPush(jpushConfig);



  function Notification() {

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
    return BadgeCollection.findOne({ uid }).then(doc => {
      let badge = 0;
      if (doc) {
        badge = doc.badge;
      }

      badge++;
      console.log(badge)
      return BadgeCollection.updateOne({ uid }, { $set: { uid, badge } }, {
        upsert: badge == 1 ? true : false,
        returnOriginal: false,
        returnNewDocument: true
      }).then(() => {
        return badge;
      });
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
      androidTokens = [];
    let { uid } = notification;
    for (let token of tokens) {
      let { client, deviceToken } = token;
      if (client == 'ios') iosTokens.push(deviceToken);
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
            console.log('.................:',result);
            console.log('sent:', result.sent.length);
            console.log('failed:', result.failed.length);
            console.log(result.failed);
            resolve(result);
          });
        } else resolve(null);
      }),
      new Promise((resolve, reject) => {
        if (androidTokens.length) {
          let ns = this._generateMessageAndroid(notification);
          console.log('.......ns',ns);
          let message = {
            msg_content: ns.alert,
            title: ns.title,
            content_type: 'text',
            extras: ns.extras
          };

          androidPush.push({
            platform: 'android',
            audience: {
              registration_id: androidTokens
            },
            notification: ns,
            message,
            options: {
              time_to_live: 60,
              // apn_production: false
            }
          }).then(r => {
            console.log('android sent:', r);
            resolve(r);
          }).catch(reject);
        } else resolve(null);
      })
    ]).then(() => {
      return this._emitNextNotification(uid);
    }).catch(error => {
      console.error(error);
      return this._emitNextNotification(uid);
    });
  };

  prototype._emitNextNotification = function(uid) {
    return this.emit('finish.notification', uid);
  };

  prototype._generateMessageIOS = function(msg) {
    let { content, from, roomid, type, badge } = msg;

    let data = {
      sound: 'ping.aiff',
      alert: content,
      payload: {
        sender: from,
        roomid,
        type
      }
    };

    if (!isNaN(badge)) data.badge = badge;
    let notification = new apn.Notification(data);
    data.topic = 'com.tlfapp';

    return notification;
  };

  prototype._generateMessageAndroid = function(msg) {
    let { content, from, roomid, type, badge } = msg;

    let notification = {
      alert: content,
      title: 'T立方',
      builder_id: 0,
      extras: {
        sender: from,
        roomid,
        type,
        badge
      }
    };

    return notification;
  };

  prototype.updateBadge = function(uid, num) {
    BadgeCollection.findOne({ uid }).then(doc => {
      if (!doc) return;

      let { badge } = doc;
      badge -= num;
      if (badge < 0) badge = 0;
      BadgeCollection.update({ uid }, { $set: { badge } });
    });
  };

  if (!vendor) {
    vendor = new Notification();
  }

  return vendor;
};
