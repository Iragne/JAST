var util = require('util'),
	redis = require('redis'),
	env = require("./env.js")
	EventEmitter = require('events').EventEmitter;
    //redis = require('redis');


const RedisEmitter_events = new EventEmitter();
RedisEmitter_events.setMaxListeners(10000000)
RedisEmitter_events.on('error',function(e){
	env.log.error("RedisEmitter_events")
	env.log.error(e)
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
        env.log.error("RedisEmitter_events ");
        env.log.error(err)
    });
    if (config.redis.password){
        subscribe.auth(config.redis.password,function(e){
        	if (e)
        		env.log.error(e)
        });
    }


	const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
	
	
	subscribe.on("pmessage", function(pattern, channel, message) {
		RedisEmitter_events.emit(channel,message);
	});
	env.log.debug("watch========>"+prefix+listener+":*")
	subscribe.psubscribe(prefix+listener+":*");
	  

};
RedisHooker.prototype.use = RedisHooker.prototype.addUse;
