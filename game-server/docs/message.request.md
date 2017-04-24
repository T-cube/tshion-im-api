# HTTP REQUEST API OF MESSAGE
## GET 获取聊天日志
/:roomid
```javascript
{ param: 'roomid', type: 'String' },
{ query: 'last', type: 'Number' },
{ query: 'pagesize', type: 'Number' }
```

## GET 获取离线消息统计
/offline/:target
```javascript
{ param: 'target', type: 'String' }
```

## DELETE 删除离线消息
/offline/:roomid
```javascript
{ param: 'target', type: 'String' }
```
