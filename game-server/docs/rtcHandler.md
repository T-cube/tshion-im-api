# RtcHandler
## rtc.rtcHandler.audioDial
*调起语音通话*
```javascript
{
  target: String(ObjectID) // 接收方的id
  dial: aid_bid
}
```

## rtc.rtcHandler.audioDialAcess
*接收语音通话*
```javascript
{
  target: String(ObjectID) // 发起方的id
}
```

## rtc.rtcHandler.audioDialReject
*拒绝语音通话*
```javascript
{
  target: String(ObjectID) // 发起方的id
}
```