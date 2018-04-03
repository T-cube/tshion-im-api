// 数组去重
Array.prototype.combine = function() {
  let arr = Array.prototype.concat.apply([], arguments);

  return Array.from(new Set(arr));
};
