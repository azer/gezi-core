var lessCommonWords = require("less-common-words");

module.exports = {
  clean: clean,
  simplify: simplify,
  keywords: keywords
};

function keywords (url) {
  url = simplify(unescape(url));
  url = url.replace(/\.(com|net|org)(\/|$|\?|\#)/, '$2');
  url = url.replace(/^\w+:\/\//, '');
  return lessCommonWords(url);
}

function clean (url) {
  return url.toLowerCase()
    .replace(/\#$/, '')
    .replace(/\?$/, '')
    .replace(/\/$/, '');
}

function simplify (url) {
  return clean(url).replace(/^www\./, '');
}
