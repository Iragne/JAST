//
// Copyright (c) 2013 Jean Alexandre Iragne (https://github.com/Iragne)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//


var util = require('util'),
	redis = require('redis'),
	env = require("./env.js"),
	EventEmitter = require('events').EventEmitter;
    //redis = require('redis');


var RedisEmitter_events = new EventEmitter();
RedisEmitter_events.setMaxListeners(10000000);
RedisEmitter_events.on('error',function(e){
	"use strict";
	env.log.error("RedisEmitter_events");
	env.log.error(e);
});
var RedisHooker = module.exports = function() {
	"use strict";
	return this;
};

RedisHooker.prototype.getEmmiter = function (){
	"use strict";
    return RedisEmitter_events;
};
RedisHooker.prototype.addUse = function(config) {
	"use strict";
//	console.log("===========Message===========2");
	var  subscribe = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
	subscribe.on("error", function (err) {
        env.log.error("RedisEmitter_events ");
        env.log.error(err);
    });
    if (config.redis.password){
        subscribe.auth(config.redis.password,function(e){
			if (e)
				env.log.error(e);
        });
    }


	var version = config.jast.version || "1";
    var namespace = config.jast.namesapce || "jast";
    var listener = config.jast.namesapcelistener || "Feeds";
    var prefix = "/"+version+"/"+namespace+"/";

	subscribe.on("pmessage", function(pattern, channel, message) {
		RedisEmitter_events.emit(channel,message);
	});
	env.log.debug("watch========>"+prefix+listener+":*");
	subscribe.psubscribe(prefix+listener+":*");
};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
