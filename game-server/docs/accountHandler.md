# accountHandler

## account.accountHandler.initInfo
```javascript

```
return request
```javascript
{
  code: 200,
  data: [
    // room map and the last message of room
    {
      room: Object,
      message: Object // the last message in this room
    },
    ...
  ]
}
```
example
```javascript
{
  code: 200,
  data:[{
    "room": {
      "_id": "58ee12190e36fe55f7255eb6",
      "roomid": "fb26ee5baa6dce0e880eca814b0dba0ef478fa4d",
      "members": ["xuezier", "xuezi"],
      "createAt": "2017-04-12T11:40:09.605Z"
    },
    "message": {
      "_id": "58da0c739775508ec99817b4",
      "content": "hh",
      "from": "xuezi",
      "target": "xuezier",
      "roomid": "fb26ee5baa6dce0e880eca814b0dba0ef478fa4d",
      "route": "onChat",
      "timestamp": 1490685043524,
      "type": "text",
      "__route__": "chat.chatHandler.send"
    }
  }]
}
```