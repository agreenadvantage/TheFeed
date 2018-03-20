var express    = require('express');
var app        = express();
var path       = require('path');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var _          = require('lodash');
var mongoose   = require('mongoose');
var dotenv     = require('dotenv').config();
var routes     = require('./middleware/routes.js');
var auth       = require('./middleware/authentication');
var util       = require('./middleware/util');
var user       = require('./middleware/user');
var changes    = require('./middleware/changes');
var setHeaders = require('./middleware/setHeaders');
var setHeaders = require('./middleware/setHeaders');
var cache      = require('./db/redis');

app.use(require('./responses'));
cache.connect();
require('./db/mongo').connect();

var pathLeader = '/feed-api';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(util.setup);
app.use(setHeaders.setHeaders);

if (process.env.NODE_ENV == 'development') {
  app.use(pathLeader + '/change/:user', auth.changeDevUser);
}

app.use(auth.getUserCredentials);
app.use(user.updateInfo);
app.use(pathLeader + '/admin', changes);
app.use(pathLeader, routes);
app.listen(8080);
