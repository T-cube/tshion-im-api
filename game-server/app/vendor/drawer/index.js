'use strict';
const fs = require('fs');
const { createCanvas, Image } = require('canvas');

class Drawer {
  constructor(width = 100, height = 100) {
    this.canvas = { width, height };
  }

  setCanvasSize({ width, height }) {
    this.canvas = {...this.canvas, width, height };
  }

  puzzle() {
    var args = Array.prototype.slice.call(arguments, 0, 4);
    var imageLength = args.length;

    var { width, height } = this.canvas;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');
    var stream = canvas.pngStream();

    var images = [];
    for (let src of args) {
      let image = new Image();
      image.src = src;
      images.push(image);
    }

    let drawWidth = (width - 10) / 2,
      drawHeight = (height - 10) / 2;
    if (imageLength == 3) {
      var image = images.shift();
      ctx.drawImage(image, (width + 10) / 4, 0, drawWidth, drawHeight);
    } else {
      let image = images.shift();
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
      image = images.shift();
      ctx.drawImage(image, drawWidth + 10, 0, drawWidth, drawHeight);
    }
    let image = images.shift();
    ctx.drawImage(image, 0, drawHeight + 10, drawWidth, drawHeight);
    image = images.shift();
    ctx.drawImage(image, drawWidth + 10, drawHeight + 10, drawWidth, drawHeight);

    return pngStream;
  }
}

var drawer = null;
module.exports = function() {
  if (!drwaer) drawer = new Drawer();

  return drawer;
};
