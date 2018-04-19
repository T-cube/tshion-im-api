const PROTOCOL_HEADER_LENTH = 5;

/**
 * defined Message class
 * @param {String} id
 * @param {String} route
 * @param {String} body
 */
exports.Message = class Message {
  constructor(id, route, body) {
    this.id = id;
    this.route = route;
    this.body = body;
  }
};

/**
 * byteArray to string
 * @param {Array} byteArray
 * @param {Number} start
 * @param {Number} end
 */
const bt2Str = function(byteArray, start, end) {
  let result = '';
  for (let i = start; i < byteArray.length && i < end; i++) {
    result = result + String.fromCharCode(byteArray[i]);
  };
  return result;
};

exports.bt2Str = bt2Str;

const Protocol = {};
exports.Protocol = Protocol;
/**
 *
 * pomele client encode
 * @param {String} id message id;
 * @param {String} route message route
 * @param {String} msg message body
 * socketio current support string
 *
 */
Protocol.encode = function(id, route, msg) {
  let msgStr = JSON.stringify(msg);
  if (route.length > 255) { throw new Error('route maxlength is overflow'); }
  let byteArray = new Uint16Array(PROTOCOL_HEADER_LENTH + route.length + msgStr.length);
  let index = 0;
  byteArray[index++] = (id >> 24) & 0xFF;
  byteArray[index++] = (id >> 16) & 0xFF;
  byteArray[index++] = (id >> 8) & 0xFF;
  byteArray[index++] = id & 0xFF;
  byteArray[index++] = route.length & 0xFF;
  for (let i = 0; i < route.length; i++) {
    byteArray[index++] = route.charCodeAt(i);
  }
  for (let i = 0; i < msgStr.length; i++) {
    byteArray[index++] = msgStr.charCodeAt(i);
  }
  return bt2Str(byteArray, 0, byteArray.length);
};

/**
 * client decode
 * @param {String} msg String data
 * @return {Object} Message Object
 */
Protocol.decode = function(msg) {
  let idx, len = msg.length,
    arr = new Array(len);
  for (idx = 0; idx < len; ++idx) {
    arr[idx] = msg.charCodeAt(idx);
  }
  let index = 0;
  let buf = new Uint16Array(arr);
  let id = ((buf[index++] << 24) | (buf[index++]) << 16 | (buf[index++]) << 8 | buf[index++]) >>> 0;
  let routeLen = buf[PROTOCOL_HEADER_LENTH - 1];
  let route = bt2Str(buf, PROTOCOL_HEADER_LENTH, routeLen + PROTOCOL_HEADER_LENTH);
  let body = bt2Str(buf, routeLen + PROTOCOL_HEADER_LENTH, buf.length);
  return new Message(id, route, body);
};
