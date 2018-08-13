# friendRequest
```js
{
  route: 'friendRequest',
  data: {
    request: String // the friend request id
    from: String // send request user id
    receiver: String // reveice request user id
    type: Enum['new', 'update', 'agree', 'reject'] // friend request type
  }
}
```

```js
{
  route: 'friend.delete',
  data: {
    friend: String // delete friend id
  }
}
```