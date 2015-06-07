var parallel = require("parallelly");
var history = require("./lib/history");
var urls = require("./lib/urls");
var titles = require("./lib/titles");
var keywords = require("./lib/keywords");
var db = require("./lib/db");
var frames = require("./lib/frames");
var visit = require("./lib/visit");

module.exports = {
  frames: frames,
  history: history,
  urls: urls,
  titles: titles,
  keywords: keywords,
  db: db,
  visit: visit,
  reset: reset
};

function reset (callback) {
  parallel()
    .run(history.reset)
    .and(titles.reset)
    .and(keywords.reset)
    .and(frames.reset)
    .done(callback);
}
