# http-message-api

## 获取离线消息
GET /message/offline/new/:roomid

param|name|type|des
-----|----|----|---
param|roomid|String|offline message target room id

## 获取离线消息统计
GET /message/offline/:uid

param|name|type|des
-----|----|----|---
param|uid|String|user _id

returns
```
{
  [
    {
      from: String,
      roomid: String,
      count: Number,
    },
    ...
  ]
}
```

## 获取聊天记录
GET /message/:roomid

param|name|type|des
-----|----|----|---
param|roomid|String|chat room id
query|last|String|the last <b>*timestamp*</b> of message list
query|pagesize|Number|optional, the size of one page list

## 获取最新聊天记录
GET /message/:roomdi/newly

param|name|type|des
-----|----|----|---
param|roomid|String|chat room id
query|index|String|the newly message <b>*timestamp*</b> of message list

## 清空某人离线消息
DELETE /message/offline/:roomid/:target

param|name|type|des
-----|----|----|---
param|roomid|String|chat room id
param|target|String|target user id