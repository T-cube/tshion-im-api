'use strict';

const MiPush = require('mipush');

const MiPushSender = new MiPush.Sender({
  appSecret: 'bf6pJcMhaLXxLOlYgzosyg=='
});

class MiPushModule {
  _message(notification) {
    var message = new MiPush.Message();
    var { alert, title, extras = {} } = notification;
    message.title = alert;
    message.description = title;
    message.restrictedPackageName = 'com.tlfapp';
    message.passThrough = 0;
    message.notifyType = -1;
    message.payload = alert;

    for (var key in extras) {
      message.extra(key, extras[key]);
    }

    return message;
  }

  sendToRegId(regId, notification) {
    var message = this._message(notification);
    return new Promise((resolve, reject) => {
      MiPushSender.sendToRegId(regId, message, function(err, result) {
        console.log.apply(null, arguments);
        if (err) return reject(err);

        resolve(result);
      });
    });
  }
}

var push = null;

/**
 * @returns {MiPushModule}
 */
module.exports = function() {
  if (!push) push = new MiPushModule();
  return push;
};
