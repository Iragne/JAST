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
    config = require("../conf.js"),
    env = require("./env.js"),
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;
var redisinstance_readwrite = null;
module.exports.use = function(config) {
	redish.use(config);
	redisinstance = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    redisinstance.on("error", function (err) {
        env.log.error("RedisEmitterSub ");
        env.log.error(err)
    });
    if (config.redis.password){
        redisinstance.auth(config.redis.password,function(e){
            if(e)
                throw e;
        });
    }
    redisinstance_readwrite = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    redisinstance_readwrite.on("error", function (err) {
        env.log.error("RedisEmitterSub ");
        env.log.error(error)
    });
    if (config.redis.password){
        redisinstance_readwrite.auth(config.redis.password,function(e){
            if(e)
                throw e;
        });
    }

    env.log.debug("create instance")
	
};

function RedisEmitterSub() {
	this._event = redish.getEmmiter();
    this._eventlist = []
};
RedisEmitterSub.prototype.subscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    var ch = channel;
    var channelclean = channel.replace(prefix,'');
//    console.log("sub count ====> "+channel);
    redisinstance_readwrite.exists(countc,function(err,e){
    	if (e)
    		redisinstance_readwrite.incr(countc)
    	else
    		redisinstance_readwrite.set(countc,1)
    });
    redisinstance_readwrite.exists(channel,function(err,dd){
        if(!dd)
        	redisinstance_readwrite.set(channel,1);
    })
    var e = {channel:channel,fct:function(datae){
        try{
            var data = JSON.parse(datae)
            a.callback(data.key,channelclean,datae)
        }catch(e){
            env.log.error(e)
        }
    }}
    this._eventlist.push(e)
	this._event.on(e.channel,e.fct);
};
RedisEmitterSub.prototype.unsubscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    env.log.debug("unsub ====> "+countc);
    
    for (var i = 0; i < this._eventlist.length; i++) {
        this._event.removeListener(this._eventlist[i].channel,this._eventlist[i].fct)
    };
    redisinstance_readwrite.decr(countc,function(e){
    	redisinstance_readwrite.get(countc,function(err,e){
    		if (e <= 0){
    			redisinstance_readwrite.del(countc);
    			if(callback)
    				callback()
    		}
    			

    	})
    	
    });
	// bind to redis automatic because watching Feeds.*
};

RedisEmitterSub.prototype.callback = function(data){
    	env.log.error("Not not implemented")
}

RedisEmitterSub.prototype.on = function(event, callback) {
	if(typeof callback !== 'function') {
		throw new Error('RedisEmitterSub Invalid addListener callback');
	}
	if(event == "pmessage"){
		this.callback = callback;
	}
};
module.exports.createSubscribe = function(){ 
    return new RedisEmitterSub()
};



function RedisEmitterPub() {
	
};
RedisEmitterPub.prototype.publish = function(channel,key,channelclean, data) {
    try {
    	env.log.info("push data===========>")
        
        
        
        //console.log(ch)
    	var a = {key:key,channel:channelclean,data:data}
    	var d = JSON.stringify(a);
    	//console.log(d)
    	redisinstance_readwrite.set(channel, d,function(err,e){
            if(err){
                env.log.error("RedisEmitterPub.prototype.set errr")
                env.log.error(err)
            }
            // console.log(channel)
            // console.log(e)
            // console.log(err)

        })
        //console.log(d)
        redisinstance.publish(channel, d);
    }catch(e){
        env.log.error("RedisEmitterPub.prototype.publish errr")
        env.log.error(e)
    }	
};
module.exports.createPublish = function(){ 
	return new RedisEmitterPub()
};











