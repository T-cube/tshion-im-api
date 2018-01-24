'use strict';
const md5File = require('md5-file');
const QINIU = require('@ym/qiniu');
const uuidv4 = require('uuid/v4');

const config = require('../../../config/config');
const qiniu = new QINIU(config.qiniu);
module.exports = function(app) {
  const db = app.db;
  const fileCollection = db.collection('file');
  const fileCacheCollection = db.collection('file.cache');

  return class File {
    /**
     * create new file
     * @param {Object} options
     * @param {String} options.filename
     * @param {String} options.hash
     * @param {String} options.url
     * @param {Number} options.size
     * @param {String} options.mimeType
     * @param {String} options.extensions
     * @param {{}} options.copy
     * @param {Number} options.createAt
     */
    constructor(options) {
      Object.assign(this, options);
      this.createAt = +new Date;
    }

    _save(col) {
      return col.insertOne(this).then(result => {
        this._id = result.insertedId;
        return this;
      });
    }

    save() {
      return this._save(fileCollection);
    }

    saveCache() {
      return this._save(fileCacheCollection);
    }

    static getFile(options) {
      return fileCollection.findOne(options);
    }

    static getCacheFile(_id) {
      return fileCacheCollection.findOne(_id);
    }

    static generateLink(key, rename) {
      return qiniu.makeLink.apply(qiniu, arguments);
    }

    /**
     * upload file to cdn
     * @param {Object} options
     * @param {String} options.savekey
     * @param {String} options.filePath
     * @param {Array} options.folder
     * @param {Boolean} options.rename
     * @return {Promise}
     */
    static saveCdn({ savekey = uuidv4(), filePath, folder, rename = false }) {
      return qiniu.upload(savekey, filePath, folder, rename).then(result => ({
        result,
        uuid: savekey
      }));
    }

    /**
     * set cdn file life circle
     * @param {{}} param0
     * @param {String} param0.key
     * @param {Number} param0.days
     */
    static setCdnLife({ key, days = 7 }) {
      return qiniu.deleteAfterDays({ key, days });
    }

    /**
     * get file hash
     * @param {String} filepath
     */
    static getFileHash(filepath) {
      return new Promise((resolve, reject) => {
        md5File(filepath, function(err, hash) {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    }

    /**
     * get hash temp file
     * @param {*} filehash
     */
    static hashGetFile(filehash) {
      return fileCacheCollection.findOne({
        hash: filehash,
      });
    }

    /**
     * get file static
     * @param {Object} options
     * @param {String} options.filename
     * @param {String} options.hash
     */
    static getStatic(options) {
      return fileCollection.findOne(options);
    }
  };
};
