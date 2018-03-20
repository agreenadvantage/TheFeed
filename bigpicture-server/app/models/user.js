var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    select: true,
    maxlength: 100,
    validate: (r)=> {return r.toLowerCase();},
  },
  email: {
    type: String,
    select: true,
    index: { unique: true },
    validate: (r)=> { return /^([a-z]+)@.*$/.test(r);},
  },
  admin: {
    type: Boolean,
    select: true,
  },
});

module.exports = mongoose.model('User', userSchema);
