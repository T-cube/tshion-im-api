'use strict';
const config = require('../../../config/config');
module.exports = function(req, res, next) {
  var file = req.files.file;
  console.log(file);
  if (!file) return next(req.apiError(400, 'file can not be null'));

  if (!file.name.toLowerCase().match(config.file.allowTypes)) return next(req.apiError(400, 'file type is not allowed'));
  if (file.size > (config.file.maxSize)) return next(req.apiError(400, 'file size is out of limit'));

  next();
};
