var crc = require('crc');

module.exports.dispatch = function (uid, connectors) {
  // console.log(':::::::::::::;', connectors, uid, Math.abs(crc.crc32(uid)) % connectors.length);
  if (connectors && connectors.length) {
    let index = 0;
    if (uid) {
      index = Math.abs(crc.crc32(uid)) % connectors.length;
    }
    return connectors[index];
  }
  return null;
};
