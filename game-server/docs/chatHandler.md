# ChatHandler
## chat.chatHandler.joinRoom
```javascript
{
  target: String(ObjectID),  // the id of who you want to talk
}
```
request return
```javascript
{
  code: Number,
  roomid: String  // 40 characters length hash
}
```
on 'joinRoom' event receive data
```javascript
{
  route: 'joinRoom',
  from: String(ObjectID),  // the id of who want to talk with you
  roomid: String
}
```

## chat.chatHandler.send
```javascript
{
  target: String,
  roomid: String,
  content: String,    // optional, if type text
  type: Enum,         // text, image, file
  url: String         // optional, if type is image or file
}
```

request return
```javascript
{}
```

on 'onChat' event receive data
```javascript
{
  from: String,
  roomid: String,
  content: String,
  url: String,
  timestamp: Number,
  route: 'onChat'
}
```

## chat.chatHandler.initGroup
```javascript
{
  members: Array,     // user_id array
  group: String       // the id of group
}
```