var lessCommonWords = require("less-common-words");
var now = require("unique-now");
var loop = require("parallel-loop");
var uniques = require("uniques");
var db = require('./db');
var urls = require("./urls");
var initialized;

module.exports = {
  init: init,
  save: save,
  add: add,
  search: search,
  reset: reset,
  get: get,
  touch: touch
};

function save (url, options, callback) {
  url = urls.simplify(url);

  if (arguments.length < 3) {
    callback = options;
    options = {};
  }

  var keywords = urls.keywords(url);
  options.title && (keywords = keywords.concat(lessCommonWords(options.title)));
  options.tags && (keywords = keywords.concat(options.tags));

  keywords = uniques(keywords);

  loop(keywords.length, each, callback);

  function each (done, index) {
    add(keywords[index], url, done);
  }
}

function add (keyword, url, callback) {
  db.oneRow('SELECT * FROM keywords WHERE url=? AND keyword=?', [url, keyword], function (error, record) {
    if (record) {
      return touch(url, keyword, callback);
    }

    db.query('INSERT INTO keywords (id, keyword, url, ts) VALUES (?, ?, ?, ?)', [now(), keyword, url, now()], callback);
  });
}

function search (keyword, callback) {
  db.query('SELECT * FROM keywords WHERE keyword=? ORDER BY ts DESC', [keyword], callback);
}

function get (url, callback) {
  db.query('SELECT * from keywords WHERE url=? ORDER BY ts DESC', [urls.simplify(url)], callback);
}

function touch (url, keyword, callback) {
  db.query('UPDATE keywords SET ts=? WHERE url=? AND keyword=?', [now(), urls.simplify(url), keyword], callback);
}

function init (callback) {
  db.query('CREATE TABLE IF NOT EXISTS keywords (id integer primary key asc, keyword text, url string, ts integer)', callback);
}

function reset (callback) {
  db.query('DROP TABLE IF EXISTS keywords', function (err) {
    if (err) return callback(err);
    initialized = false;
    init(callback);
  });
}
