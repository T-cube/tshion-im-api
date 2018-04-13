'use strict';
const knowError = {
  200: 'OK',
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  500: 'internel_server_error',
  503: 'service_unavailable',
};
// HTTP/1.1 400 Bad Request
// Content-Type: application/json

// {
//   "code": {http_status_code},
//   "error": "{error}",
//   "error_description":{error_description}
// }
const apiError = function (code, message) {
  console.log(message);
  if (typeof message == 'object') {
    let e = message.message;
    e.code = message.code || 500;
    e.error = knowError[e.code];
    e.error_description = message.message;
    return e;
  } else {
    let e = new Error(message);
    e.message = message;
    e.code = knowError.hasOwnProperty(code) && code || 500;
    e.error = knowError[code] || knowError[500];
    e.error_description = message;
    return e;
  }
};

module.exports = apiError;
