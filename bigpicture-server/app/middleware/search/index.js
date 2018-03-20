var cache = require('../db/redis');
var moment = require('moment');
var uuidv4 = require('uuid/v4');
var _Tag   = require('../tagObject');
var _ = require('lodash');
var funcs = {};
const util = require('util');

module.exports = funcs;

funcs.connect = cache.connect;

var catcher = function (data) {
  console.log(data);
};

var authorIsValid = function (author) {
  let isValid = /^[A-Za-z]{1,50}$/.test(author);
  return isValid;
};

funcs.makePageTokenCacheKey = function (pageToken) {
  return '#pageToken|' + pageToken;
};

funcs.makeSearchToken = function (searchObject) {
  return new Promise((resolve, reject) => {
    let pageToken = uuidv4();
    let key = funcs.makePageTokenCacheKey(pageToken);

    cache.update(key, JSON.stringify(searchObject), 30 * 60)
    .then(success => {
      if (success) {
        return resolve(pageToken);
      } else {
        return resolve(false);
      }
    })
    .catch(err => {
      catcher(err);
      resolve(false);
    });
  });
};

funcs.getSearchFromCache = function (pageToken) {
  return new Promise((resolve, reject)=> {
    if (!pageToken) {
      return resolve(false);
    }

    let key = funcs.makePageTokenCacheKey(pageToken);
    cache.get(key)
    .then(searchObject=> {
      if (searchObject) {
        return resolve(JSON.parse(searchObject));
      }else {
        resolve(false);
      }
    });
  });
};

funcs.buildSearchObject = (req, res, next)=> {
  // Parameters:
  // tags = csv of tag strings
  // author = string
  // unreader = string
  // before = DATE
  // after = DATE
  // pageToken

  new Promise((resolve, reject)=> {
    if (req.query.pageToken) {
      let direction = req.query.direction || 'next';
      funcs.getSearchFromCache(req.query.pageToken)
      .then(searchObject=> {
        if (!searchObject) {
          return resolve(false);
        }else {
          searchObject._id = searchObject.pages[direction];
          return resolve(searchObject);
        }
      });
    }else {
      return resolve(null);
    }
  })
  .then(searchObject=> {
    let searchDates = [
      { term: 'before', search: '$lt' },
      { term: 'after',  search: '$gt' },
    ];
    let search = {};

    if (searchObject === false) {
      return res.fail('Page Token does not exist');
    }else {
      if (searchObject) {
        search = searchObject;
      }else if (searchObject !== false) {

        if (req.query.before || req.query.after) {
          search.date = {};
          _.forEach(searchDates, dateParams=> {
            if (req.query[dateParams.term]) {
              let theTime = moment(req.query[dateParams.term]);
              if (theTime.isValid()) {
                search.date[dateParams.search] = theTime.toDate();
              }
            }
          });
        }

        //pull out tags
        if (req.query.tags) {
          let rawTags = req.query.tags.trim().split(',');
          if (rawTags && rawTags.length >= 1) {
            let tags = rawTags.filter(_Tag.isValid);
            if (tags && tags.length) {
              search.tags = { $all: tags };
            }
          }
        }

        //get unread things
        if (req.query.author && !req.query.unreader) {
          let author = req.query.author.toLowerCase();
          if (authorIsValid(author)) {
            search['author.name'] = author;
          }
        }else if (req.query.unreader) {
          let unreader = req.query.unreader.toLowerCase();
          search.$or = [];
          if (authorIsValid(unreader)) {
            search.$or.push({ unreaders: unreader });
            search.$or.push({ unreplies: unreader });
          }
        }

        search.limit = Math.max(Math.min(30, req.query.limit || 10), 1);
      }

      req.searchQuery = search;
      return next();
    }
  });
};
