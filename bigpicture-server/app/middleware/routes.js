var routes       = require('express').Router();
var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var _            = require('lodash');
var Tag          = require('../models/tag');
var Update       = require('../models/update');
var User         = require('../models/user');
var Change       = require('../models/change');
var searchStuff  = require('./search');
var _Tag         = require('./tagObject');
var cache        = require('../db/redis');

var tagKey = 'tags';

//------------------------------------------------

var catcher = function (data) {
  console.log(data);
};

if (process.env.NODE_ENV == 'development') {
  // Add some dang default crappus
  let someTags = ['my cool tag', 'your cool tag', 'hello world'];
  let someUpdates = [
    {
      author: { name: 'Adam', id: 'SomeRandomId' },
      update: 'This is my cool update',
      tags: someTags,
      unreaders: ['seth', 'sam', 'adam', 'andy', 'shi', 'tiffa', 'monique'],
    },
  ];
  _.forEach(someTags, tag => {
    let theTag = new Tag({ tag: tag });
    theTag.save(err => {
      if (err) {
        console.log("Couldn't add tags in dev mode -- probably already in db");
      }
    });
  });
  _.forEach(someUpdates, update => {
    let theUpdate = new Update(update);
    theUpdate.save();
  });
}

var processDates = function (dateRange) {
  var dateArr = dateRange.split('-');
  _.forEach(dateArr, function (date, idx) {
    dateArr[idx] = date.trim();
    dateArr[idx] = new Date(dateArr[idx]);
    if (idx != 0) {
      var temp = dateArr[idx].setHours(23, 59, 59, 0);
      dateArr[idx] = new Date(temp);
    }
  });

  return dateArr;
};

var saveUpdatedStati = function (stati, promises) {
  return new Promise(function (resolve, reject) {
    _.forEach(stati, function (status) {
      var _that = status;

      promises.push(
        new Promise(function (resolve, reject) {
          var time = setTimeout(resolve, 5000);
          Update.update({ _id: _that._id }, { $set: { tags: _that.tags } }, function (err, doc) {
            if (!err) {
              clearTimeout(time);
              resolve(_that._id);
            }
          });
        })
      );
    });

    resolve(promises);
  });
};

routes.post('/tags', function (req, res) {
  var newTag = new Tag({ tag: req.body.tag.toLowerCase().trim() });
  newTag.save(function (err, data) {
    let msg = '';
    if (!err || err.code == 11000) {
      res.succeed(null, 'Tag: ' + req.body.tag + ', added to the db!');
    }else {
      res.fail('something went wrong while trying to add your tag!');
    }
  });
});

routes.get('/tags', function (req, res) {
  _Tag.getFromCache()
  .then(function (result) {
    res.succeed(tagArr);
  })
  .catch(function (result) {
    Tag.find({}, function (err, data) {
      if (!err) {
        var tagArr = [];
        if (data.length >= 1) {
          _.forEach(data, function (tag) {
            tagArr.push(tag.tag);
          });

          res.succeed(tagArr);
        }else {
          res.succeed(null, 'No tags were found!');
        }
      }else {
        res.fail(err.message);
      }
    });
  });
});

routes.post('/updates', function (req, res) {
  var update = new Update(req.body.update);
  update.save(function (err, doc) {
    if (!err) {
      res.succeed(doc);
    }else {
      res.fail(err.message);
    }
  });
});

routes.put('/updates/:postId', function (req, res) {
  var postId = req.params.postId;
  var tags  = req.body.tags;
  var reply = req.body.reply;
  change = {};

  if (tags) {
    change = { $set: { tags: tags } };
  } else if (reply) {
    replyMod = { text: reply.text, author: { name: reply.author, id: reply.authorId } };
    change = { $push: { replies: replyMod, unreplies: { $each: reply.unreplies } } };
  } else {
    change = undefined;
  }

  if (postId != null && change != undefined) {
    Update.findOneAndUpdate({ _id: postId }, change, { new: true }, function (err, doc) {
      if (!err) {
        if (reply) {
          let newReplyIdx = doc.replies.length - 1;
          res.succeed(doc.replies[newReplyIdx]);
        }else if (tags) {
          res.succeed(doc.tags);
        }
      }else {
        res.fail(err.message);
      }
    });
  }

});

routes.put('/updates/:id/unreaders', function (req, res) {
  var id = req.params.id;
  var reader = req.body.reader;
  var query = { $pull: { unreaders: reader, unreplies: reader } };
  Update.update({ _id: id }, query, function (err, doc) {
    if (!err) {
      res.succeed();
    }else {
      res.fail(err.message);
    }
  });
});

routes.get('/updates', searchStuff.buildSearchObject, function (req, res) {

  let sort = -1;
  if (req.query.direction == 'previous') {
    sort = 1;
  }

  let options = { limit: req.searchQuery.limit, sort: { _id: sort } };

  delete req.searchQuery.limit;
  delete req.searchQuery.pages;

  Update.find(req.searchQuery, '', options, (err, updates)=> {
    if (err) {
      return res.fail('Something bad happened');
    }else {

      // Got a list of results -- there MIGHT BE MORE
      let searchMetadata = {};
      if (req.query.direction == 'previous') {
        updates.reverse();
      }

      if (updates.length >= 1) {
        let lastId = updates[updates.length - 1]._id.toString();
        let firstId = updates[0]._id.toString();

        let pages = { next: { $lt: lastId }, previous: { $gt: firstId } };

        req.searchQuery.limit = options.limit;
        req.searchQuery.pages = pages;

        searchStuff.makeSearchToken(req.searchQuery)
        .then(pageToken => {
          if (pageToken) {
            searchMetadata.pageToken = pageToken;
          }
          console.log('sample update', updates[0]);
          return res.succeed(updates, '', searchMetadata);
        })
        .catch(function (err) {
          catcher(err);
        });
      }else {
        let metaData = { info: '' };
        if (req.query.direction == 'previous' || req.query.direction == 'next') {
          metaData.info = 'last page';
        }else {
          metaData.info = 'No search results';
        }

        return res.succeed([], 'Failed to get any updates!', metaData);
      }
    }
  });
});

routes.get('/users', function (req, res) {
  User.find({}, { name: 1, _id: 0 }, function (err, docs) {
    if (!err) {
      var userArr = [];
      if (docs.length >= 1) {
        _.forEach(docs, function (user) {
          userArr.push(user.name);
        });

        res.succeed(userArr);
      }
    }else {
      res.fail('Getting the list of authors failed with this message: ' +
                            err.message + '& with this error code: ' + err.code);
    }
  });
});

routes.delete('/tag', function (req, res) {
  if (req.output.userInfo.isAdmin) {
    var tag = false;
    if (req.body && req.body.tag) {
      tag = req.body.tag;
      _Tag.delete(tag, req, res);
    }
  }else {
    res.fail("you don't have permission to do that!");
  }
});

routes.patch('/updates', function (req, res, next) {
  var find = null;
  var replace = null;
  if (req.query.find && req.query.replace) {
    find = req.query.find;
    replace = _Tag.prepare(req.query.replace);
    _Tag.findOrInsert(replace)
    .then(function () {
      var changes = { all: [], addedIds: [], removedIds: [], '-': find, '+': replace, };
      _Tag.getAllUpdatesWithTag(find)
      .then(function (stati) {
        if (stati.length > 0) {
          var promiseList = [];
          _Tag.replaceTagsInUpdates(stati, find, replace)
          .then(function (changedObj) {
            saveUpdatedStati(changedObj.stati, promiseList)
            .then(function (promises) {
              return Promise.all(promiseList)
              .then(function (changed) {
                changes.all = changed;
                changes.addedIds = changedObj.added;
                changes.removedIds = changedObj.removed;
                var mChange = new Change(changes);
                mChange.save()
                .then(function (err, doc) {
                  return res.succeed(changes);
                })
                .catch(function (err) {
                  catcher(err);
                  return res.fail('couldn\'t save tag changes');
                });
              })
              .catch(function (err) {
                catcher(err);
                return res.fail('couldn\'t finish the promise list');
              });
            })
            .catch(function (err) {
              catcher(err);
              return res.fail('couldn\'t save the changed updates');
            });
          })
          .catch(function (err) {
            catcher(err);
            return res.fail('couldn\'t replace the tags in the updates updates');
          });
        }else {
          return res.fail('no status found to update');
        }
      })
      .catch(function (err) {
        catcher(err);
        return res.fail('Failed to get updates');
      });
    })
    .catch(function (err) {
      catcher(err);
      return res.fail('Failed to upsert tag');
    });
  }
});

module.exports = routes;
