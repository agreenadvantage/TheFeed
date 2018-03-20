var Tag = require('../models/tag');
var Update = require('../models/update');
var _ = require('lodash');
var cache = require('../db/redis');

var self = module.exports = {
  delete: function (tag, req, res) {
    Tag.remove({ tag: tag }, function (err) {
      if (!err) {
        res.succeed();
      }else {
        res.fail('Delete tag failed with message:', err.message, 'and error code:', err.code);
      }
    });
  },

  prepare: function (tag) {
    return tag.trim().toLowerCase();
  },

  isValid: function (tag) {
    var regexp = /^[a-z0-9\s]+$/;
    var valid = false;
    if (regexp.test(tag)) {
      valid = true;
    }

    return valid;
  },

  findOrInsert: function (tag) {
    return new Promise(function (resolve, reject) {
      if (self.isValid(tag)) {
        Tag.findOneAndUpdate({ tag: tag }, { }, { upsert: true }, function (err, doc) {
          if (!err) {
            resolve();
          }else {
            reject();
          }
        });
      }else {
        reject();
      }
    });
  },

  getAllUpdatesWithTag: function (tag) {
    return new Promise(function (resolve, reject) {
      Update.find({ tags: { $all: tag } }, function (err, stati) {
        if (!err) {
          resolve(stati);
        }else {
          reject();
        }
      });
    });
  },

  replaceTagsInUpdates: function (stati, find, replace) {
    return new Promise(function (resolve, reject) {
      let changed = {
        stati: [],
        added: [],
        removed: [],
      };

      if (stati.length >= 1) {
        _.forEach(stati, function (status) {
          let tagIDX = status.tags.indexOf(find);
          let replaceIDX = status.tags.indexOf(replace);

          if (replaceIDX === -1) {
            status.tags[tagIDX] = replace;
            changed.added.push(status._id.toString());
            changed.removed.push(status._id.toString());
          }else {
            status.tags.splice(tagIDX, 1);
            changed.removed.push(status._id.toString());
          }
        });

        changed.stati = stati;
        resolve(changed);
      }else {
        reject();
      }
    });
  },

  updateCache: function () {
    return new Promise(function (resolve, reject) {
      Tag.find({}, (err, tags) => {
        if (err) {
          reject(err);
        }else {
          let tagNames = [];
          tags.forEach(tag => { tagNames.push(tag.tag); });
          cache.update('#TAGSCACHE', JSON.stringify(tagNames))
          .then(updateSucceeded => {
            if (updateSucceeded) {
              return resolve(tagNames);
            }else { return reject('FAILED TO CACHE TAGS');}
          });
        }
      });
    });
  },

  getFromCache: function () {
    return new Promise(function (resolve, reject) {
      cache.get('#TAGSCACHE')
      .then(tagListString=> {
        if (tagListString) {
          return resolve(JSON.parse(tagListString));
        }else {
          self.updateCache()
          .then(listOfTags=> {
            if (listOfTags) {
              return resolve(listOfTags);
            }else {
              return reject('FAILED TO CACHE TAGS');
            }
          });
        }
      });
    });
  },
};
