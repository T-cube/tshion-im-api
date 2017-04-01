# entryHandler

## connector.entryHandler.entry
*user entry connector*
```javascript
{
  cid: String,      // the id of user current company id
  uid: String       // user id
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