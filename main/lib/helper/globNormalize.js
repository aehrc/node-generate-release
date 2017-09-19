// Generated by CoffeeScript 1.12.7
(function() {
  var Glob, Path, globNormalize,
    slice = [].slice;

  Glob = require('glob');

  Path = require('path');

  globNormalize = function() {
    var file, files, i, item, j, len, len1, params, ref;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    files = [];
    for (i = 0, len = params.length; i < len; i++) {
      item = params[i];
      if (typeof item === 'string') {
        ref = Glob.sync(item);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          file = ref[j];
          files.push(Path.resolve(file));
        }
      } else if (Array.isArray(item)) {
        files = files.concat(globNormalize.apply({}, item));
      } else {
        throw new Error(item + " is not an array or a string.");
      }
    }
    return files.sort().filter(function(item, pos, self) {
      return !pos || item !== self[pos - 1];
    });
  };

  module.exports = globNormalize;

}).call(this);
