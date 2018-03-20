var changes      = require('express').Router();
var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Change       = require('../models/change');

changes.delete('/changes', function (req, res) {
  if (req.output.userInfo.isAdmin === true) {
    mongoose.connection.collections['changes'].drop(function (err) {
      res.json({ success: true, error: err });
    });
  }else {
    res.status(403);
  }
});

changes.get('/changes', function (req, res) {
  Change.find({}, function (err, docs) {
    res.json({ error: err, docs: docs });
  });
});

module.exports = changes;
