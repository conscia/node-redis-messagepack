var _ = require('lodash');

module.exports.process = function (properties) {
  if (properties.options.return_buffers)
    return handlerBuffers(properties);
  else
    return defaultHandler(properties);
};

var handlerBuffers = function (opts) {
  var result = opts.result;
  var command = opts.command;
  if (_.isPlainObject(result)) {
    //loop through each array element
    _.each(result, function (value, ix) {
      result[ix] = opts.deserializer(value);
    });
  }

  else if (result.toString() !== "OK") {
    try {
      result = opts.deserializer(result);
    }
    catch (e) {
      console.error("JSON.parse failed on command '%s' with value"
        + " '%s'. This command may need to be black listed"
        , command, result);
    }
  }

  return result;
};

var defaultHandler = function (opts) {
  var result = opts.result;
  var command = opts.command;

  if (Array.isArray(result)) {
    //loop through each array element
    result.forEach(function (value, ix) {
      if (!value instanceof Buffer) {
        result[ix] = opts.deserializer(value);
      }
    });
  }
  else if (!(result instanceof Buffer) && result.toString() !== "OK") {
    try {
      result = opts.deserializer(result);
    }
    catch (e) {
      console.error("JSON.parse failed on command '%s' with value"
        + " '%s'. This command may need to be black listed"
        , command, result);
    }
  }
  return result;
};
