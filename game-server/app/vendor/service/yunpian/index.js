'use strict';

const request = require('request');

/**
 * yunpian sdk class
 *
 * @class YunPian
 */
class YunPian {
  static SENDSINGLEINTERNATIONALSMSURL = 'https://sms.yunpian.com/v2/sms/single_send.json'

  /**
   * Creates an instance of YunPian.
   * @param {any} { apikey }
   * @memberof YunPian
   */
  constructor({ apikey }) {
    this.apikey = apikey;
  }

  /**
   * convert phone number to +xxxxx
   *
   * @param {any} mobile
   * @returns
   * @memberof YunPian
   */
  _convertInternationalPhone(mobile) {
    let test_phone = decodeURIComponent(mobile);

    if (!/^\+/.test(test_phone)) test_phone = `+${test_phone}`;
    return encodeURIComponent(test_phone);
  }

  /**
   * send single sms
   *
   * @param {any} { url, mobile, text }
   * @returns
   * @memberof YunPian
   */
  _sendSingleSms({ url, mobile, text }) {
    return new Promise((resolve, reject) => {
      mobile = this._convertInternationalPhone(mobile);
      request.post(url, {
        body: JSON.stringify({
          apikey: this.apikey,
          mobile,
          text
        }, function(err, res, body) {
          if (err) return reject(err);

          body = JSON.parse(body);
          if (body.code) {
            return reject(body);
          }
          resolve(body);
        })
      });
    });
  }

  /**
   * send single international sms
   *
   * @param {any} { mobile, text }
   * @returns
   * @memberof YunPian
   */
  sendSingleInternationalSms({ mobile, text }) {
    const url = YunPian.SENDSINGLEINTERNATIONALSMSURL;

    return this._sendSingleSms({ url, mobile, text });
  }
}
