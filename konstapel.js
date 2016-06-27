var Cryptr = require('cryptr'),
    Knas = require('knas');

var K = module.exports = function(tokenKey, signupKey) {
  if (!tokenKey) {
    throw new Error("tokenKey required");
  }
  if (signupKey) {
    this.opts = {
      signupKey: signupKey
    };
  }
  this.cryptr = new Cryptr(tokenKey);
}

// LOGIN flow

K.prototype.findUserByUsername = function(req, res, next) {
  this.users.findOne({username: req.body.user}, function(err, doc) { // doc is {} or null
    if (err) return next(err);

    req.user = doc;
    return next();
  });
}

K.prototype.usernameIsValid = function(req, res, next) {
  if (!req.user) {
    return next(new Knas(401, 'Invalid username'));
  }
  return next();
}

K.prototype.pwdIsValid = function(req, res, next) {
  this.bcrypt.compare(req.body.pwd, req.user.pwd, function(err, res) {
    if (err) return next(err);

    if (!res) {
      return next(new Knas(401, 'Invalid password'));
    }
    return next();
  });
}

// SIGNUP flow

K.prototype.checkSignupKey = function(req, res, next) {
  if (req.body.key !== this.opts.signupKey) {
    return next(new Knas(401, 'Invalid key'));
  }
  return next();
}

K.prototype.findUsers = function(req, res, next) {
  this.users.find({}, {username: 1, _id: 0})
    .map(function(doc){
      return doc.username;
    })
    .toArray(function(err, docs){
      if (err) return next(err);

      req.temp = {usernames: docs};
      return next();
    });
}

K.prototype.usernameNotTaken = function(req, res, next) {
  if (req.temp.usernames.indexOf(req.body.user) < 0) {
    return next();
  } else {
    return next(new Knas(400, 'Username taken'));
  }
}

K.prototype.insertUser = function(req, res, next) {
  var self = this;

  this.bcrypt.hash(req.body.pwd, 10, function(err, hash) {
    if (err) return next(err);

    var doc = {
      username: req.body.user,
      pwd: hash
    };

    self.users.insert(doc, function(err, docs){
      if (err) return next(err);

      req.user = docs.ops[0];
      return next();
    });
  });
}

K.prototype.createToken = function(req, res, next) {
  var token = this.cryptr.encrypt(req.user._id);
  req.data = {token: token, username: req.user.username};
  return next();
}

K.prototype.verifyToken = function(req, res, next) {
  var token = req.headers && req.headers.token || // token in header
              req.body && req.body.token || // token in body via POST
              req.query && req.query.token || // token in query via GET
              false;
  
  if (!token) {
    return next(new Knas(401, 'Not authorized'));
  }

  try {
    var userId = this.cryptr.decrypt(token);
    req.temp = {id: userId};
    return next();
  } catch (err) {
    return next(new Knas(401, 'Invalid token'));
  }
}

K.prototype.findUserById = function(req, res, next) {
  var oid = this.oid(req.temp.id);

  this.users.findOne({_id: oid}, function(err, doc) { // doc is {} or null
    if (err) return next(err);

    if (!doc) {
      return next(new Knas(401, 'Invalid token'));
    }
    req.user = doc;
    return next();
  });
}
