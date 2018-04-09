# http-message-api

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
      count: Number,
    },
    ...
  ]
}
```