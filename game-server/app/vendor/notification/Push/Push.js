'use strict';

module.exports = class Push {
  _message(notification) {
    var message = new MiPush.Message();
    var { alert, title, extras = {} } = notification;
    message.title = title;
    message.description = alert;
    message.restrictedPackageName = 'com.tlfapp';
    message.passThrough = 0;
    message.notifyType = -1;
    message.payload = alert;

    for (var key in extras) {
      message.extra(key, extras[key]);
    }

    return message;
  }
};