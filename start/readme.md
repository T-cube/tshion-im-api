## add method to connector.js
```js
var decodeHex = function(str) {
  var byteArray = new Uint16Array();
  var result = '';
  for(var i =0; i< str.length/2; i++) {
    var index = i*2;
    result += String.fromCharCode(parseInt(str.substring(index, index+2),16)) ;
  }
  return result;
}
```

## modify socket.on('message'), add code to head
```js
if(/^\w+$/g.test(msg)) {
  msg = decodeHex(msg);
  console.log('wow, messages !!!', msg);
}
```