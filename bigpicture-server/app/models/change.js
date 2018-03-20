var mongoose = require('mongoose');

var changeSchema = new mongoose.Schema({
  all: {
    type: [String],
  },
  addedIds: {
    type: [String],
  },
  removedIds: {
    type: [String],
  },
  '+': {
    type: String,
  },
  '-': {
    type: String,
  },
});

module.exports = mongoose.model('Change', changeSchema);
