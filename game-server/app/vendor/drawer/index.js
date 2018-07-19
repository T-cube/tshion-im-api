'use strict';
const fs = require('fs');
const request = require('request');
const { createCanvas, Image } = require('canvas');
const uuidv4 = require('uuid/v4');
const path = require('path');

class Drawer {
  constructor(width = 100, height = 100) {
    this.tmpMap = new Map();
    this.tmpId = 0;
    this.canvas = { width, height };
  }

  setCanvasSize({ width, height }) {
    this.canvas = {...this.canvas, width, height };
  }

  cleartTmp(tmpId) {
    var tmp = this.tmpMap.get(tmpId);
    if (tmp) {
      tmp.forEach(_path => {
        fs.unlinkSync(_path);
      });
      this.tmpMap.delete(tmpId);
    }
  }

  puzzle() {
    var args = Array.prototype.slice.call(arguments, 0, 4);
    var imageLength = args.length;
    var tmpId = this.tmpId++;
    var tmp = [];

    var { width, height } = this.canvas;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');
    var stream = canvas.pngStream();

    var images = [];
    var promises = [];
    for (var src of args) {

      promises.push((new Promise((resolve, reject) => {
        var _path = __dirname + '/tmp/' + uuidv4() + path.extname(src);
        var out = fs.createWriteStream(_path)
        request(src).pipe(out);
        out.on('finish', () => {
          tmp.push(_path);
          var image = new Image();
          image.src = _path;
          images.push(image);
          resolve();
        });
      })));
    }

    return Promise.all(promises).then(() => {
      this.tmpMap.set(tmpId, tmp);
      var drawWidth = (width - 10) / 2,
        drawHeight = (height - 10) / 2;
      if (imageLength == 3) {
        var image = images.shift();
        ctx.drawImage(image, (width + 10) / 4, 0, drawWidth, drawHeight);
      } else {
        var image = images.shift();
        ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
        image = images.shift();
        ctx.drawImage(image, drawWidth + 10, 0, drawWidth, drawHeight);
      }
      var image = images.shift();
      ctx.drawImage(image, 0, drawHeight + 10, drawWidth, drawHeight);
      image = images.shift();
      ctx.drawImage(image, drawWidth + 10, drawHeight + 10, drawWidth, drawHeight);

      return { stream, tmpId };
    }).catch(console.error)
  }
}

var drawer = null;
/**
 * @returns {Drawer}
 */
module.exports = function() {
  if (!drawer) drawer = new Drawer();

  return drawer;
};
