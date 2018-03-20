var jwt = require('jsonwebtoken');
var redir = 'http://localhost:8080';
var auth = {};

var testUserEmail = process.env.TEST_USER_EMAIL;

auth.getUserCredentials = function (req, res, next) {
  var userInfo = false;
  var isAdmin  = false;
  var bsEmailReg = /^([a-z]+)@.*$/i; //this matches...
  //and groups bsEmails into a list: 0-Email,1-Name,2-email suffix
  if (process.env.NODE_ENV=='development' && testUserEmail) {
    isAdmin = true;
    var userEmail = testUserEmail;

    userInfo = bsEmailReg.exec(userEmail);
  }else {
    if (req.headers && req.headers.authorization) {
      var signed = req.headers.authorization.split(' ').pop();
      var decoded = jwt.verify(signed, process.env.FEED_SECRET, { algorithms: ['HS256'] });
      if (decoded.email && bsEmailReg.exec(decoded.email)) {
        userInfo = bsEmailReg.exec(decoded.email);
      }
    }else {
      return res.redirect(redir);
    }
  }

  if (userInfo) {
    req.output.userInfo.email = userInfo[0];
    req.output.userInfo.name = userInfo[1];
    req.output.userInfo.isAdmin = isAdmin;

    req.output.verified = true;
  }else {
    return res.redirect(redir);
  }

  return next();
};

auth.changeDevUser = function (req, res, next) {
  if (process.env.NODE_ENV=='development') {
    testUserEmail = req.params.user;
    res.json({
      success: true,
      message: 'user changed to: ' + testUserEmail,
    });
  }else {
    res.status(403, 'You should\'t be here!');
  }
};

module.exports = auth;
