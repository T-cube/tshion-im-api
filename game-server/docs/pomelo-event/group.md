# group.join
```js
{
  route: 'group.join',
  data: {
    group: String // the group id
    type: 'add'
  }
}
```

# group.member.delete
```js
{
  route: 'group.member.delete'
  data: {
    group: String,
    user: String
  }
}
```

# group.member.quit
```js
{
  route: 'group.member.quit'
  data: {
    group: String,
    user: String
  }
}
```