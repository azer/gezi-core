var now = require("unique-now");
var parallel = require("parallelly");
var loop = require("parallel-loop");
var keywords = require("./keywords");
var db = require('./db');
var urls = require("./urls");
var initialized;

module.exports = {
  reset: reset,
  init: init,
  visit: visit,
  get: get,
  getById: getById
};

function get (url, callback) {
  db.oneRow('SELECT * FROM history WHERE url=?', [urls.simplify(url)], callback);
}

function getById (id, callback) {
  db.oneRow('SELECT * FROM history WHERE id=?', [id], callback);
}

function visit (url, callback) {
  url = urls.simplify(url);

  get(url, function (error, record) {
    if (record) {
      return visitAgain(record.id, callback);
    }

    visitFirstTime(url, callback);
  });
}

function visitFirstTime (url, callback) {
  var id = now();
  var sql = 'INSERT INTO history (id, url, ts) VALUES (?, ?, ?)';

  parallel()
    .run(db.query, [sql, [id, url, Date.now()]])
    .done(function (errors) {
      if (errors) return callback(errors[0]);
      callback(undefined, id);
    });
}

function visitAgain (id, callback) {
  var sql = 'UPDATE history SET ts=? WHERE id=?';

  parallel()
    .run(db.query, [sql, [Date.now(), id]])
    .done(function (errors) {
      if (errors) return callback(errors[0]);
      callback(undefined, id);
    });
}

function init (callback) {
  if (initialized) return callback();

  initialized = true;

  db.query('CREATE TABLE IF NOT EXISTS history (id integer primary key asc, url text unique, ts integer)', callback);
}

function reset (callback) {
  db.query('DROP TABLE IF EXISTS history', function (err) {
    if (err) return callback(err);

    db.query('DROP TABLE IF EXISTS active', function (err) {
      if (err) return callback(err);

      initialized = false;
      init(callback);
    });
  });
}
