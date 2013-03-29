var util = require('util'),
	redis = require('redis'),
	EventEmitter = require('events').EventEmitter;
    //redis = require('redis');


const RedisEmitter_events = new EventEmitter();
RedisEmitter_events.setMaxListeners(10000000)
RedisEmitter_events.on('error',function(e){
	console.log("RedisEmitter_events")
	console.log(e)
})
var RedisHooker = module.exports = function() {
	return this;
};

RedisHooker.prototype.getEmmiter = function (){
    return RedisEmitter_events;
}
RedisHooker.prototype.addUse = function(config) {
//	console.log("===========Message===========2");

	const subscribe = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
	subscribe.on("error", function (err) {
        console.log("RedisEmitter_events " + err);
    });
    if (config.redis.password){
        subscribe.auth(config.redis.password,function(e){

        });
    }


	const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
	
	
	subscribe.on("pmessage", function(pattern, channel, message) {
		//console.log(message)
		RedisEmitter_events.emit(channel,message);
	});
	console.log("watch========>"+prefix+listener+":*")
	subscribe.psubscribe(prefix+listener+":*");
	  

};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
