# gateHandler

## gate.gateHandler.queryEntry
*user login*
```javascript
{
  token: String, // access_token
  uid: String, // userid
}
```
request return
```javascript
{
  host: String,       // the connector host
  port: Number,       // the connector port
  init_token: String
}
```

## tokenEntry
*use init token to login*
```javascript
{
  init_token: String,
  cid: String       // company id
}
```
request return
```javascript
  host: String,
  port: Number
```