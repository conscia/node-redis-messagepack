/**
 * Created by ferron on 4/4/16.
 */

module.exports = RedisSerializer;

RedisSerializer.blacklist = ["info"];

function RedisSerializer(redis, opts) {
  var lastArgType;

  opts = opts || {};

  //save a reference to the real send_command method
  redis.__internal_send_command__ = redis.internal_send_command;

  //define the send_command proxy method
  redis.internal_send_command = function (command, args, callback) {
    //don't do json stuff on blacklisted commands or if we are not ready yet
    if (!this.ready || ~RedisSerializer.blacklist.indexOf(command)) {
      return redis.__internal_send_command__.apply(redis, arguments);
    }

    if (process.domain && callback) {
      callback = process.domain.bind(callback);
    }

    //loop through each arg converting to JSON if possible
    args.forEach(function (arg, ix) {
      //only stringify the key if that has been requested
      if (ix === 0 && !opts.jsonKey) {
        //don't do anything: args[ix] = arg;
      }
      //make sure the arg is not a buffer
      else if (!(arg instanceof Buffer)) {
        args[ix] = opts.serializer(arg);
      }
    });

    //call the real send_command method
    redis.__internal_send_command__(command, args, function (err, result) {
      if (Array.isArray(result)) {
        //loop through each array element
        result.forEach(function (value, ix) {
          if (!value instanceof Buffer) {
            result[ix] = opts.deserializer(value);
          }
        });
      }
      else if (!(result instanceof Buffer) && result !== "OK") {
        try {
          result = opts.deserializer(result);
        }
        catch (e) {
          console.error("JSON.parse failed on command '%s' with value"
            + " '%s'. This command may need to be black listed"
            , command, result);
        }
      }

      return callback && callback(err, result);
    });
  };

  return redis;
}
