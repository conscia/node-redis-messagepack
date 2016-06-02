/**
 * Created by ferron on 4/4/16.
 */

var handlers = require('./handlers');
var Command;

try {
  Command = require('../../redis/lib/command');
} catch  (e) {
  // test-module
  Command = require('../node_modules/redis/lib/command');
}

module.exports = RedisSerializer;

RedisSerializer.blacklist = ["info"];

function RedisSerializer(redis, opts) {

  opts = opts || {};

  //save a reference to the real send_command method
  redis.__internal_send_command__ = redis.internal_send_command;

  //define the send_command proxy method
  redis.internal_send_command = function (command) {
    //don't do json stuff on blacklisted commands or if we are not ready yet
    if (!this.ready || ~RedisSerializer.blacklist.indexOf(command.command)) {
      return redis.__internal_send_command__.apply(redis, arguments);
    }

    if (process.domain && command.callback) {
      command.callback = process.domain.bind(command.callback);
    }

    if (command.args) {
      //loop through each arg converting to JSON if possible
      command.args.forEach(function (arg, ix) {
        //only stringify the key if that has been requested
        if (ix === 0 && !opts.jsonKey) {
          //don't do anything: args[ix] = arg;
        } else if (ix > 0 && opts.ignore && new RegExp(opts.ignore).test(arg)) {
          //don't do anything: args[ix] = arg;
        } else if (ix > 0 && opts.ignoreIndex && ~opts.ignoreIndex.indexOf(ix)) {
          //don't do anything: args[ix] = arg;
        }
        //make sure the arg is not a buffer
        else if (!(arg instanceof Buffer)) {
          command.args[ix] = opts.serializer(arg);
        }
      });
    }

    //call the real send_command method
    redis.__internal_send_command__(new Command(command.command, command.args, function (err, result) {

      if (result != null) {
        result = handlers.process({
          command: command,
          result: result,
          options: redis.options,
          err: err,
          deserializer: opts.deserializer
        });
      }

      return command.callback && command.callback(err, result);
    }));
  };
  return redis;
}
