'use strict';

module.exports = function(app) {
  const File = require('../../models/file')(app);

  return function(req, res, next) {
    var file = req.files.file;

    File.getFileHash(file.path).then(hash => {
      var filename = file.name || file.filename;
      return File.getStatic({ filename, hash }).then(staticFile => {
        if (staticFile) return res.sendJson(staticFile);

        req.files.file.hash = hash;
        next();
      });
    }).catch(next);
  };
};
