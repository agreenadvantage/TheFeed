// Author: Adam Coster
var mongoose = require( 'mongoose');
mongoose.Promise = Promise ;
var mongo = {connected: false};

mongo.connect = ()=>{
  const options = {useMongoClient: true};
  let uri = `mongodb://mongo/db`;
  mongoose.connect(uri, options);
  mongo.connected=true;
};

module.exports = mongo;
