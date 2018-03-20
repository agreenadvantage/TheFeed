var util = {};

util.setup = function (req, res, next) {
  req.output = {
    verified: false,
    success: false,
    userInfo: {
      name: '',
      email: '',
      isAdmin: false,
    },
    message: '',
    error: '',
    data: {
      receivedAt: Date.now(),
    },
  };
  return next();
};

module.exports = util;
