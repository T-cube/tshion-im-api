'use strict';
const mime = require('mime');
const path = require('path');
const http = require('http');

const config = require('../../../../config/config');
const fileFilter = require('../../middleware/file-filter');
module.exports = function(app) {

  const fileHash = require('../../middleware/file-hash')(app);

  const File = require('../../../models/file')(app);
  const ObjectID = app.ObjectID;

  return {
    post: {
      '': {
        docs: {
          name: '上传文件',
          params: [{ key: 'file', type: 'FormData' }]
        },
        middleware: [fileFilter, fileHash],
        method(req, res, next) {
          var file = req.files.file;
          var body = req.body;

          var hash = file.hash;
          var filename = file.name || file.filename;

          var mimeType = mime.getType(file.name);
          var extensions = path.extname(file.name).replace('.', '');


          return File.hashGetFile(hash).then(doc => {
            var options = {
              filename,
              hash: hash,
              size: file.size,
              mimeType,
              extensions
            };

            for (let key in body) {
              options[key] = body[key];
            }

            if (doc) {

              options.url = doc.url;
              options.copy = doc._id;
              return new File(options).save().then(result => {
                res.sendJson(result);
              });

            } else {
              var cdnData = {
                filePath: file.path,
                folder: [extensions]
              };

              return File.saveCdn(cdnData).then(data => {
                var cache = {
                  filename: `${data.uuid}.${extensions}`,
                  hash,
                  size: file.size,
                  mimeType,
                  extensions,
                  cdn: data.result,
                  url: `${data.result.server_url}/${data.result.key}`
                };

                return new File(cache).saveCache().then(cacheFile => {
                  options.url = cacheFile.url;
                  options.copy = cacheFile._id;

                  return new File(options).save().then(newFile => {
                    res.sendJson(newFile);
                  });
                });
              });
            }
          }).catch(next);
        }
      },
      'temporary': {
        docs: {
          name: '上传临时文件',
          params: [{ key: 'file', type: 'FormData' }]
        },
        middleware: [fileFilter, fileHash],
        method(req, res, next) {
          // console.log(req.body, req.files.file)
          var file = req.files.file;
          var body = req.body;

          var hash = file.hash;
          var filename = file.name || file.filename;

          var mimeType = mime.getType(file.name);
          var extensions = path.extname(file.name).replace('.', '');


          return File.hashGetFile(hash).then(doc => {
            var options = {
              filename,
              hash: hash,
              size: file.size,
              mimeType,
              extensions
            };

            for (let key in body) {
              options[key] = body[key];
            }

            if (doc) {

              options.url = doc.url;
              options.copy = doc._id;
              return new File(options).save().then(result => {
                res.sendJson(result);
              });

            } else {
              var cdnData = {
                filePath: file.path,
                folder: [extensions]
              };

              return File.saveCdn(cdnData).then(data => {
                var cache = {
                  filename: `${data.uuid}.${extensions}`,
                  hash,
                  size: file.size,
                  mimeType,
                  extensions,
                  cdn: data.result,
                  url: `${data.result.server_url}/${data.result.key}`
                };

                File.setCdnLife({ key: data.result.key }).then(console.log).catch(console.error);

                return new File(cache).saveCache().then(cacheFile => {
                  options.url = cacheFile.url;
                  options.copy = cacheFile._id;

                  return new File(options).save().then(newFile => {
                    res.sendJson(newFile);
                  });
                });
              });
            }
          }).catch(next);
        }
      }
    },
    get: {
      'image/thumbnail/:_id': {
        docs: {
          name: '获取缩小图片',
          params: [
            { param: '_id', type: 'String' },
            { query: 'w', type: 'Number' },
            { query: 'h', type: 'Number' },
          ]
        },
        method(req, res, next) {
          // /thumbnail/<Width>x<Height>>
          // console.log(req)
          File.getFile({ _id: ObjectID(req.params._id) }).then(file => {
            if (!file) return next(req.apiError(404, 'file not found'));

            var copy = file.copy;

            return File.getCacheFile(ObjectID(copy)).then(origin => {
              var { w = 200, y = 300 } = req.query;
              var key = `${origin.cdn.key}?imageMogr2/thumbnail/${w}x${y}`;
              // console.log(key)
              return File.generateLink(key).then(link => {
                // console.log(link)
                res.redirect(301, link);
              });
            });
          }).catch(next);
        }
      },
      'image/view/:_id': {
        docs: {
          name: '查看图片',
          params: [{ param: '_id', type: 'String' }]
        },
        method(req, res, next) {
          File.getFile({ _id: ObjectID(req.params._id) }).then(file => {
            if (!file) return next(req.apiError(404, 'file not found'));

            var copy = file.copy;

            return File.getCacheFile(ObjectID(copy)).then(origin => {
              let cdn = origin.cdn;
              return File.generateLink(`${cdn.key}`).then(link => {
                // var req = http.request(link, response => {
                //   res.setHeader('Content-Type', file.mimeType);

                //   response.on('readable',()=>{
                //     response.pipe(res);
                //   });
                // });
                // req.end();
                res.redirect(301, link);
              });
            });
          }).catch(next);
        }
      },
      'audio/:_id': {
        docs: {
          name: '下载音频文件',
          params: [
            { param: '_id', type: 'String' },
            { query: 'rename', type: 'String' }
          ],
        },
        method(req, res, next) {
          File.getFile({ _id: ObjectID(req.params._id) }).then(file => {
            if (!file) return next(req.apiError(404, 'file not found'));

            var copy = file.copy;

            return File.getCacheFile(ObjectID(copy)).then(audio => {
              let cdn = audio.cdn;

              return File.generateLink(cdn.key, req.query.rename).then(link => {
                res.redirect(301, link);
              });
            });
          }).catch(next);
        }
      },
      'file/:_id': {
        docs: {
          name: '下载文件',
          params: [
            { param: '_id', type: 'String' },
            { query: 'rename', type: 'String' }
          ]
        },
        method(req, res, next) {
          File.getFile({ _id: ObjectID(req.params._id) }).then(file => {
            if (!file) return next(req.apiError(404, 'file not found'));

            var copy = file.copy;

            return File.getCacheFile(ObjectID(copy)).then(origin => {
              let cdn = origin.cdn;

              return File.generateLink(cdn.key, req.query.rename).then(link => {
                res.sendJson({download_url: link});
                // res.redirect(301, link);
              });
            });
          }).catch(next);
        }
      }
    }
  };
};
