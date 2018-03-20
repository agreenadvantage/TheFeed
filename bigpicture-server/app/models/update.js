var mongoose  = require('mongoose');

var authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: (r)=> { return /^[A-Za-z]{1,50}$/.test(r);},
  },
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

var replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  author: {
    type: authorSchema,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

var updateSchema = new mongoose.Schema({
  update: {
    type: String,
    required: true,
    minLength: 16,
  },
  author: {
    type: authorSchema,
    index: true,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
    default: Date.now,
  },
  tags: {
    type: [String],
    index: true,
  },
  replies: {
    type: [replySchema],
  },
  unreaders: {
    type: [String],
    index: true
  },
  unreplies: {
    type: [String],
    index:true
  },
});



module.exports = mongoose.model('Update', updateSchema);
