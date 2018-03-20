var User = require('../models/user');
var user = {};

user.updateInfo = function (req, res, next) {
  if (req.output.userInfo) {
    var userInfo = req.output.userInfo;
    var bscotch = { name: userInfo.name, email: userInfo.email, admin: userInfo.isAdmin };
    var query = { email: userInfo.email };
    User.findOneAndUpdate(query, bscotch, { upsert: true, new: true }, function (err, doc) {
      if (!err) {
        var time = 1000 * 60 * 60 * 24 * 180;
        var id = doc._id.toString();
        res.cookie('DashId', id, { maxAge: time, httpOnly: false });
        res.cookie('DashUserName', req.output.userInfo.name, { maxAge: time, httpOnly: false });
        res.cookie('DashEmail', req.output.userInfo.email, { maxAge: time, httpOnly: false });
        res.cookie('DashIsAdmin', req.output.userInfo.isAdmin, { maxAge: time, httpOnly: false });

        return next();
      }else {
        req.output.message = ('Unable to update user collection with error: ' + err.message +
                              ' With error code:' + err.code);
        res.json(req.output);
        return;
      }
    });
  }
};

module.exports = user;
