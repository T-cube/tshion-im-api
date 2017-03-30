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
request return
```javascript
{
  roomid: String
}
```
on 'groupInit' event reveive data
```javascript
{
  route: 'groupInit',
  group: String,
  roomid: roomid
}
```

## chat.chatHandler.addGroupMember
```javascript
{
  group: String,
  members: Array    // the members who you want to add into this group
}
```
request return
```javascript
{
  members: Array    // the result of the new group members array
}
```
on 'addMember' event receive data
```javascript
{
  route: 'addMember',
  group: String,
  members: Array,   // the members who added to this group
  from: String
}
```


## chat.chatHandler.removeGroupMember
```javascript
{
  group: String,
  members: Array    // the members who you want to remove from this group
}
```
request return
```javascript
{
  members: Array    // the result of the new group members array
}
```
on 'removeMember' event receive data
```javascript
{
  route: 'removeMember',
  group: String,
  members: Array,   // the members who left from this group
  from: String
}
```
on 'leaveGroup' event receive data
```javascript
{
  route: 'leaveGroup',
  group: String,    // the group you need to remove
  from: String
}
```

## chat.chatHandler.sendGroup
```javascript
{
  group: String,
  content: String,    // optional, if type text
  type: Enum,         // text, image, file
  url: String         // optional, if type is image or file
}
```
request return
```javascript
{}
```
on 'groupChat' event receive data
```javascript
{
  from: String,
  roomid: String,
  group: String,
  content: String,
  url: String,
  timestamp: Number,
  route: 'onChat'
}
```