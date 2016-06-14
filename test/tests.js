var test = require('tape'),
    Konstapel = require('../konstapel.js'),
    klang = new Konstapel('tokenKey', 'signupKey');

test('constructor', function(t){
  function noArgs() {
    var kling = new Konstapel();
  }
  t.throws(noArgs, /tokenKey required/, 'throws on no tokenKey')
  t.equal(klang.opts.signupKey, 'signupKey', '.opts.signupKey');
  t.equal(typeof klang.cryptr.encrypt, 'function', '.cryptr.encrypt');
  t.equal(typeof klang.cryptr.decrypt, 'function', '.cryptr.decrypt');
  t.end();
});

test('.usernameIsValid', function(t){
  var pass = klang.usernameIsValid({user: {}}, null, function(){
        return true;
      }),
      fail = klang.usernameIsValid({}, null, function(err){
        return err;
      });

  t.equal(pass, true, 'calls next if req.user');
  t.equal(fail instanceof Error, true, 'returns error if !req.user');
  t.end();
});

test('.checkSignupKey', function(t){
  var pass = klang.checkSignupKey({body: {key: 'signupKey'}}, null, function(){
        return true;
      }),
      fail = klang.checkSignupKey({body: {key: ''}}, null, function(err){
        return err;
      });

  t.equal(pass, true, 'calls next on a match');
  t.equal(fail instanceof Error, true, 'returns error on no match');
  t.end();
});

test('.usernameNotTaken', function(t){
  var reqPass = {
        temp: {usernames: ['lucy', 'john', 'erin']},
        body: {user: 'mike'}
      },
      reqFail = {
        temp: {usernames: ['lucy', 'john', 'mike']},
        body: {user: 'mike'}
      },
      pass = klang.usernameNotTaken(reqPass, null, function(){
        return true;
      }),
      fail = klang.usernameNotTaken(reqFail, null, function(err){
        return err;
      });

  t.equal(pass, true, 'calls next if no match');
  t.equal(fail instanceof Error, true, 'returns error on a match');
  t.end();
});

test('.createToken', function(t){
  var req = {
        user: {_id: 'abc123', username: 'mike'}
      },
      pass = klang.createToken(req, null, function(){
        return true;
      });

  t.equal(req.data.token, '806a7f191e18', 'token');
  t.equal(req.data.username, 'mike', 'username');
  t.equal(pass, true, 'calls next');
  t.end();
});

test('.verifyToken', function(t){
  var req = {body: {token: '806a7f191e18'}},
      pass = klang.verifyToken(req, null, function(){
        return true;
      }),
      fail = klang.verifyToken({}, null, function(err){
        return err;
      });

  t.equal(req.temp.id, 'abc123', 'decrypts userId');
  t.equal(pass, true, 'calls next on valid token');
  t.equal(fail instanceof Error, true, 'returns error on no token');  
  t.end();
});
