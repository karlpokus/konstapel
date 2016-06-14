[![npm version](https://badge.fury.io/js/konstapel.svg)](https://badge.fury.io/js/konstapel)
[![Build Status](https://travis-ci.org/karlpokus/konstapel.svg?branch=master)](https://travis-ci.org/karlpokus/konstapel)

# konstapel
Authorization middleware for node.js

# Features
- Protects resources on the server
- Creates and verifies tokens
- Verifies signupKey (optional)
- Depends on [miffo](https://github.com/karlpokus/miffo) for middleware functions that manipulate data
- Very homemade and tailored to my needs. Probably not suitable for production

# Install
```
$ npm install konstapel [miffo]
```

# Usage
```javascript
var Konstapel = require('konstapel'),
    klang = new Konstapel(<tokenKey>, <signupKey>), // signupKey optional
    Miffo = require('miffo'),
    db = new Miffo(<url>, <collections>);

db.start();

app.use('/items',
  klang.verifyToken.bind(klang),
  klang.findUserById.bind(db)
);

// signup flow
app.post('/signup',
  klang.checkSignupKey.bind(klang),
  klang.findUsers.bind(db),
  klang.usernameNotTaken,
  klang.insertUser.bind(db),
  klang.createToken.bind(klang),
  defaultResponse
);

// login flow
app.post('/login',
  klang.findUserByUsername.bind(db),
  klang.usernameIsValid,
  klang.pwdIsValid.bind(db),
  klang.createToken.bind(klang),
  defaultResponse
);    
```

# Test
```
$ npm test
```

# license
MIT
