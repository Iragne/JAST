var util = require('util'),
    //redis = require('redis'),
//    uuid = require('node-uuid'),
    RedisHooker = require('./RedisHooker.js');
   

var redish = new RedisHooker();
var redisinstance = null;

module.exports.use = function(redis,options) {
	redish.use(redis,options);
	redisinstance = redis.createClient();
};

var RedisEmitterSub = module.exports.createSubscribe = function() {
	this._event = RedisEmitter_events;
	return this;
};




RedisEmitterSub.prototype.addSubscribe = function(channel, callback) {
	this._event.on(channel,this.callbackListner);
	// bind to redis automatic because watching Feeds.*
};
RedisEmitterSub.prototype.subscribe = RedisEmitterSub.prototype.addSubscribe;



RedisEmitterSub.prototype.addListener = function(event, callback) {
	if(typeof callback !== 'function') {
		throw new Error('RedisEmitterSub Invalid addListener callback');
	}
	
	if(event == "pmessage"){
		if (typeof this._callback == 'function'){
			// clean reciver remove ob ...
		}	
		this._callback = callback;
	}
};
RedisEmitterSub.prototype.on = RedisEmitterSub.prototype.addListener;

RedisEmitterSub.prototype.callbackListner = function (msg){
	this._callback(msg)
};





var RedisEmitterPub = module.exports.createPublish = function() {
	return this;
};
RedisEmitterSub.prototype.addPublish = function(channel, data) {
	publish.publish(channel, data);
};
RedisEmitterSub.prototype.publish = RedisEmitterSub.prototype.addPublish;













