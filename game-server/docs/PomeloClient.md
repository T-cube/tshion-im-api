# Pomelo Client Side

## Docs
### Apis
|Api        |Demo         |Description|
|-----------|-------------|-----------|
|request    |pomelo.request(route,data,callback)| like a http-request include send&receive data,callback has an argument is that service return data
|notify     |pomelo.notify(route,data)| like request api,but only has send data,without receive data
|on         |pomelo.on(event,callback)|listen an event,when service notify this client event,will emit callback,callback has an argument is this service return data if it's having

*you can not use XHR(XMLHttpRequest) or fetch to instead pomelo.request. because pomelo.request is an socket Communication event, not a really http-request. it is just like a http-request,the same as pomelo.notify.*

### Events
|Event        |Callback Data    |Description      |
|-------------|-----------------|-----------------|
|onChat       |{<b>from</b>:who sent message to you, <b>timestamp</b>: the time that mesaage was sent,<b>type</b>:the message type, <b>content</b>:the message content }|when some one send a message to you will emit this event
|onAdd        |{<b>user</b>: login friend's username or id}|when a friend login in, will emit this event to notify you
|joinRoom     |{<b>from</b>: who want to chat with you, <b>roomid</b>: the id of this chat room}|if some ont want to chat with you, will send message to this event before chat
|onLeave      |{<b>user</b>:the offline friend's username of id}|when a friend offline,will emit this event

*events callback only have an argument is that service returns data if it is having.*