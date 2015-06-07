var history = require("./history");
var urls = require("./urls");
var frames = require("./frames");
var keywords = require("./keywords");
var titles = require("./titles");

module.exports = visit;
module.exports.complete = complete;

function visit (url, callback) {
  frames.open(url, function (error, frameId) {
    if (error) return callback(error);

    history.visit(url, function (error, historyId) {
      if (error) return callback(error);

      callback(undefined, {
        frameId: frameId,
        historyId: historyId
      });
    });
  });
}

function complete (options, callback) {
  titles.save(options.url, options.title, function (error) {
    if (error) return callback(error);
    keywords.save(options.url, options, callback);
  });
}
