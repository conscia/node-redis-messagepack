# Node Redis Messagepack Wrapper

Save messagepack (hex) representation of objects to redis when using node_redis


### Build Status
[![Build Status](https://semaphoreci.com/api/v1/dwayne/node-redis-messagepack/branches/master/badge.svg)](https://semaphoreci.com/dwayne/node-redis-messagepack)

### Rationale

Our use case requires us to save json to the database (preferably in an encoded format that fast to encode/decode). As far as I can tell there isn't 
a way to make @mranney's [node_redis](https://github.com/mranney/node_redis) 
implicitly convert objects and arrays to msgpack buffers before they are sent off to redis.
So I would always to have to wrap my set and get calls with msgpack.encode/decode
nonsense. 

### How

This module exports a function which when passed a RedisClient instance will 
proxy the send_command method and convert anything that is not a Buffer to and 
from messagepack. I considered modifying the RedisClient prototype automatically when 
this module is included in your project, but decided against it because you may
not want this behavior on all of your redis clients.

### Installation

with npm...

```bash
npm install redis-messagepack
```

or with git...

```bash
git clone git://github.com/conscia/node-redis-messagepack.git
```

### example

```javascript

var redis = require('redis'),
    serializer = require('redis-messagepack'),
    client = serializer(redis.createClient({return_buffers : true}), {
        serializer: function(args) {
            return msgpack.encode(args);
        },
        deserializer: function(args) {
            return msgpack.decode(args);
        }
    });


client.set('asdf', {
    foo: "bar"
}, function(err, result) {
    client.get('asdf', function(err, result) {
        console.log(result);
        // should be { foo : "bar" } and not [Object object]

        client.quit(function() {});
    });
});	

```

### Extras

```javascript
var serializer = require('redis-messagepack');

//add somecommand to the blacklist
serializer.blacklist.push('somecommand');

//dump the blacklist to console
console.log(serializer.blacklist);

// this will prevent 1st & second params from be serialized
serializer.ignoreIndex([0,1]);

// this will prevent any argument matching the regex from being serialized
serializer.ignore("_.*"); // any string starting with an underscore will be ignored

```

### Contributions

Most of the logic came from @wakdanker [node-redis-jsonify](https://github.com/wankdanker/node-redis-jsonify) library.
Special thanks to him

### License

### The MIT License (MIT)


Copyright (c) 2016 Ferron Hanse

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
