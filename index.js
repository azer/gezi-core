var parallel = require("parallelly");
var history = require("./lib/history");
var urls = require("./lib/urls");
var keywords = require("./lib/keywords");
var db = require("./lib/db");
var frames = require("./lib/frames");

module.exports = {
  frames: frames,
  history: history,
  urls: urls,
  keywords: keywords,
  db: db,
  reset: reset
};

function reset (callback) {
  parallel()
    .run(history.reset)
    .and(urls.reset)
    .and(keywords.reset)
    .and(frames.reset)
    .done(callback);
}
