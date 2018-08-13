# Collection message
```
{
  "_id": ObjectId,
  "content": String,        // 文本内容
  "from": String,           // 发送者
  "roomid": String,         // 房间号
  "route": String,          // 响应事件
  "group": String,          // 可选，群id
  "timestamp": Number,      // 消息时间
  "type": String,           // 消息类型
  "sourceid" : String,      // 资源id
  "__route__": String       // 发起事件
}
```

# Collection message.offline
```
{
  "_id": ObjectId,
  "content": String,        // 文本内容
  "from": String,           // 发送者
  "roomid": String,         // 房间号
  "route": String,          // 响应事件
  "group": String,          // 可选，群id
  "timestamp": Number,      // 消息时间
  "type": String,           // 消息类型
  "sourceid" : String,      // 资源id
  "__route__": String       // 发起事件
}
```