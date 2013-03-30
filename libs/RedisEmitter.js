var util = require('util'),
    redis = require('redis'),
    config = require("../conf.js"),
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;
var redisinstance_readwrite = null;
module.exports.use = function(config) {
	redish.use(config);
	redisinstance = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    redisinstance.on("error", function (err) {
        console.log("RedisEmitterSub " + err);
    });
    if (config.redis.password){
        redisinstance.auth(config.redis.password,function(e){
            if(e)
                throw e;
        });
    }
    redisinstance_readwrite = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
    redisinstance_readwrite.on("error", function (err) {
        console.log("RedisEmitterSub " + err);
    });
    if (config.redis.password){
        redisinstance_readwrite.auth(config.redis.password,function(e){
            if(e)
                throw e;
        });
    }

    console.log("create instance")
	
};

function RedisEmitterSub() {
	this._event = redish.getEmmiter();
    this._eventlist = []
};
RedisEmitterSub.prototype.subscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    var ch = channel;
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
            a.callback(data.key,channel,datae)
        }catch(e){
            console.log(e)
        }
    }}
    this._eventlist.push(e)
	this._event.on(e.channel,e.fct);
	// bind to redis automatic because watching Feeds.*
};
RedisEmitterSub.prototype.unsubscribe = function(channel,prefix, callback) {
    var a = this;
    var countc = prefix+"ChannelsCounter"+channel;
    console.log("unsub ====> "+countc);
    
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
    	console.log("Not not implemented")
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
RedisEmitterPub.prototype.publish = function(channel,key, data) {
    try {
    	console.log("push data===========>")
        var cc = channel.split(':');
        var ch = cc.shift();
        ch = cc.shift();
        ch = cc.shift();
        ch = cc.shift();
        //console.log(ch)
    	var a = {key:key,channel:channel,data:data}
    	var d = JSON.stringify(a);
    	//console.log(d)
    	redisinstance_readwrite.set(channel, d,function(err,e){
            if(err){
                console.log("RedisEmitterPub.prototype.set errr")
                console.log(err)
            }
            // console.log(channel)
            // console.log(e)
            // console.log(err)

        })
        //console.log(d)
        redisinstance.publish(channel, d);
    }catch(e){
        console.log("RedisEmitterPub.prototype.publish errr")
        console.log(e)
    }	
};
module.exports.createPublish = function(){ 
	return new RedisEmitterPub()
};











