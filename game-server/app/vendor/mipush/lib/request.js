/**
 * Created by yiban on 2016/10/14.
 */
"use strict";

const debug   = require('debug')('MiPush:request'),
      request = require('request');

function _request(method, url, data, callback) {
  debug('_request:', method, url, data);

  var options = {
    url    : url,
    method : method,
    headers: {
      'Authorization': 'key=' + this.appSecret
    }
  };

  if (method === 'GET') options.qs = data;
  if (method === 'POST') options.form = data;
  request(options, callback);
}

module.exports = function (method, url, data, callback) {
  _request.call(this, method, url, data, callback);
};