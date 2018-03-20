var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
  tag: {
    type: String,
    unique: true,
    index: true,
    validate: (r)=> { return /^[a-z\s]{1,32}$/.test(r);},
  },
});
module.exports = mongoose.model('Tag', tagSchema);
