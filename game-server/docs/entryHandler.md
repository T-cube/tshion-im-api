# entryHandler

## connector.entryHandler.entry
*user entry connector*
```javascript
{
  init_token: String,
  cid: String,      // the id of user current company id
}
```
request return
```javascript
{
  members: Array    // the online users of current company
}
```

## connector.entryHandler.kick
*user log out*