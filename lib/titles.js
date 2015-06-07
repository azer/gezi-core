var now = require("unique-now");
var db = require("./db");
var urls = require("./urls");
var initialized;

module.exports = {
  init: init,
  save: save,
  get: get,
  reset: reset
};

function init (callback) {
  if (initialized) return callback();

  initialized = true;

  db.query('CREATE TABLE IF NOT EXISTS urls (id integer primary key asc, url text unique, title text)', callback);
}

function reset (callback) {
  db.query('DROP TABLE IF EXISTS urls', function (err) {
    if (err) return callback(err);
    initialized = false;
    init(callback);
  });
}

function save (url, title, callback) {
  var id;
  url = urls.simplify(url);

  get(url, function (error, record) {
    if (error || !record) {
      id = now();
      db.query('INSERT INTO urls (id, url, title) VALUES (?, ?, ?)', [id, url, title], callback);
      return;
    }

    db.query('UPDATE urls SET title=? WHERE id=?', [title, record.id], callback);
  });
}

function get (url, callback) {
  db.oneRow('SELECT * FROM urls WHERE url=?', [urls.simplify(url)], callback);
}
