var util = require('util'),
    //redis = require('redis'),
//    uuid = require('node-uuid'),
//    EventEmitter = require('events').EventEmitter,
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;

//RedisEmitter_events = new EventEmitter();

module.exports.use = function(redis,options) {
	redish.use(redis,options);
	redisinstance = redis.createClient();
};

function RedisEmitterSub() {
	this._event = redish.getEmmiter();
	//return this;
};




RedisEmitterSub.prototype.addSubscribe = function(channel, callback) {
    var a = this;
//    redisinstance.set(channel,1);
	this._event.on(channel,function(data){
//	    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
	    //console.log(data)
	    redisinstance.set(channel,data);
    	a.callback(data)
	});

	// bind to redis automatic because watching Feeds.*
};
RedisEmitterSub.prototype.subscribe = RedisEmitterSub.prototype.addSubscribe;

RedisEmitterSub.prototype.callback = function(data){
    	console.log("Not not implemented")
}

RedisEmitterSub.prototype.addListener = function(event, callback) {
	if(typeof callback !== 'function') {
		throw new Error('RedisEmitterSub Invalid addListener callback');
	}
	
	if(event == "pmessage"){
		this.callback = callback;
	}
};
RedisEmitterSub.prototype.on = RedisEmitterSub.prototype.addListener;



module.exports.createSubscribe = function(channel,data){ 
    return new RedisEmitterSub(channel,data)
};



function RedisEmitterPub(channel,data) {
//	redisinstance.sadd(channel,data)
	redisinstance.publish(channel, data);
	//return this;
};
RedisEmitterPub.prototype.addPublish = function(channel, data) {
//    console.log("******************************************************************");
//    console.log(channel)
//    console.log(data)
    try {
        //json_data = JSON.stringify(data);
        redisinstance.publish(channel, data);
    }catch(e){
        console.log("NNNNNNNNNNNNN errr")
        console.log(e)
    }

	
};
RedisEmitterPub.prototype.publish = RedisEmitterPub.prototype.addPublish;

module.exports.createPublish = function(channel,data){ 
	return new RedisEmitterPub(channel,data)
};











