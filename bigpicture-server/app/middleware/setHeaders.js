var header = {};

header.setHeaders = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');


  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
};

module.exports = header;
