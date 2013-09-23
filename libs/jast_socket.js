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

var Mutex = require('mutex'),
    crypto = require('crypto'),
    redis = require('redis'),
    env = require("./env.js"),
    config = require("../conf.js");


var redis_mutex = redis.createClient(config.redis.port,config.redis.host,config.redis.host.options || {});
redis_mutex.on("error", function (err) {
    "use strict";
    env.log.error("FILE:jast_socket.js","redis_mutex " + err);
});
if (config.redis.password){
    redis_mutex.auth(config.redis.password,function(e){
        "use strict";
        if (e){
            env.log.error(e);
            throw e;
        }
    });
}
var mutex = new Mutex({redis:redis_mutex,pass:config.redis.password});

var checkdata = function(socket,data,clientid,appkey){
    "use strict";
    var key = data.key;
    var client = data.client;
    if (clientid !== null && appkey !== null && (clientid != client || key != appkey)){
        socket.disconnect();
        return false;
    }
    return true;
};

module.exports.runsio = function (DB,redis_emmitter,t_admin_key,ns,next){
    "use strict";
    var version = config.jast.version || "1";
    var namespace = config.jast.namesapce || "jast";
    var listener = config.jast.namesapcelistener || "Feeds";
    var prefix = "/"+version+"/"+namespace+"/";
    var admin_channel = prefix+listener+":1:1:admin_channel";



    env.log.debug("FILE:jast_socket.js","JAST SOCKET IO");
    ns.on('connection', function(socket) {
        env.log.debug("FILE:jast_socket.js","connection recived ip:"+socket.handshake.address.address);
        var subscribe = null;
        var publish = null;

        var publishp = null;

        var clientid = null;
        var appid = null;
        var appkey = null;

        var channels = [];
        var diconnect_fct = function(channel,prefix,listener,clientid,appid,redis_emmitter,admin_channel){
            subscribe.unsubscribe(channel,prefix,function(){
                // plus de subscriber au channel
                // kill pooler du channel
                var clientapppooler = channel;
                clientapppooler = clientapppooler.replace(prefix+listener,prefix+"Poolers");
                //clientapppooler.replace(clientapppooler,)prefix+listener+":"+clientid+':'+appid+':'
                DB.del(clientapppooler);
                DB.get(clientapppooler,function(err,e){
                    // keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                    var m = {
                        clientid: clientid,
                        appid:appid,
                        channel:channel
                    };
                    redis_emmitter.createPublish().publish(admin_channel,"killpooler",channel,m);
                });
            });
        };
        socket.on('disconnect',function (){
            if (subscribe && channels.length){
                for (var i = 0; i < channels.length; i++) {
                    var channel = channels[i].channel;
                    diconnect_fct(channel,prefix,listener,clientid,appid,redis_emmitter,admin_channel);
                }
            }
        });
        socket.on('publish', function(data,fct) {
            if (!checkdata(socket,data,clientid,appkey))
                return;
            env.log.debug("FILE:jast_socket.js","publish "+ socket.handshake.address.address);
            if(!appkey)
                appkey = data.key;
            if (!clientid)
                clientid = data.client;
            if(!appid)
                appid = data.app;

            var channel = data.channel;
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var AppsKey = clientid+":"+appid+":"+appkey;
            //check clients and key

            DB.sismember(prefix+'AppsKey', AppsKey, function(err, datar) {
                if (datar){
                    if (publish === null){
                        publish = redis_emmitter.createPublish();
                    }
                    publish.publish(ch, "message",channel,data.message);
               }else{
                    env.log.error("FILE:jast_socket.js","No key for the client found: "+clientid+":"+appkey);
                    // close all
                }
            });
            if(fct)
                fct(0,'ok');
        });

        socket.on('usubscribe', function(data) {

            if (!checkdata(socket,data,clientid,appkey))
                return;
            env.log.debug("FILE:jast_socket.js","unsubscribe " + socket.handshake.address.address);
            var url = data.url;
            var keyurlclient = null;
            if (url){
                keyurlclient = "Poolers:"+clientid+':'+crypto.createHash('sha1').update(url).digest('hex');
                data.channel = keyurlclient;
            }
            var channel = null;
            if (datae.channel)
                channel = datae.channel;
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var clientapppooler = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            //var keyurlclient = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
            subscribe.unsubscribe(ch,prefix,function(){
                // call del pooler
                // mutex(clientapppooler)
                // dec
                // si dec == 0
                DB.get(clientapppooler,function(err,e){
                    var m = {
                        clientid: clientid,
                        appid:appid,
                        channel:channel
                    };
                    redis_emmitter.createPublish().publish(admin_channel,"killpooler",channel,m);
                });
            });
        });

        socket.on('psubscribe', function(datae) {
            if (!checkdata(socket,datae,clientid,appkey))
                return;
            env.log.debug("FILE:jast_socket.js",'psubscribe '+ socket.handshake.address.address);

            if(!appkey)
               appkey = datae.key;
            if (!clientid)
                clientid = datae.client;
            if(!appid)
               appid = datae.app;

            var url = datae.url;
            var ttl = datae.ttl;
            var keyurlclient = null;
            var feed = datae.feed || (url ? 1 : 0) || 0;
            var diff = datae.diff || 0;

            if (url){
                var urlk = crypto.createHash('sha1').update(url).digest('hex');
                keyurlclient = "Poolers:"+clientid+':'+urlk;
                datae.channel = urlk;
            }
            var channel = null;
            if (datae.channel)
                channel = datae.channel;

            env.log.info("FILE:jast_socket.js","Subscribe to c:"+channel+" a:"+appid+" cl:"+clientid);
            var ch = prefix+listener+":"+clientid+":"+appid+":"+channel;
            var clientAndKey = clientid+":"+appid+":"+appkey;

            DB.sismember(prefix+'AppsKey', clientAndKey, function(err, data) {
                if (data){
                    if (subscribe === null){
                        env.log.debug("FILE:jast_socket.js","create sub on channel: "+channel);
                        subscribe =redis_emmitter.createSubscribe(ch);
                    }
                    channels.push({channel:ch});

                    subscribe.on("pmessage", function(key,channelclean,pmessage) {
                        socket.emit(key, pmessage);
                    });


                    subscribe.subscribe(ch,prefix);
                    if (feed)
                        DB.get(ch,function (err,elt){
                           if (elt && elt != "1"){
                               try{
                                    socket.emit('message', elt);
                               }catch(e){

                               }
                           }
                        });

                }else{
                    env.log.error("FILE:jast_socket.js","No key for the client found here : " + clientAndKey + " in "+prefix+' AppsKey' +" channel send " + channel);
                    // close all
                }
            });
            if (url){
                env.log.debug("FILE:jast_socket.js","URL found :"+url);
                // ask for create poolers
                var keyurlclient2 = prefix+"Poolers:"+clientid+':'+appid+':'+crypto.createHash('sha1').update(url).digest('hex');
                //var clientapppooler = prefix+"Poolers:"+clientid+':'+appid+':'+channel;
                var m = {url: url,
                        ttl: ttl,
                        clientid: clientid,
                        appid:appid,
                        keysecret:appkey,
                        channel:channel
                };
                var m2 = JSON.stringify(m);

                mutex.isolateCondRetry(keyurlclient2, 100000000, function check(callback) {
                    callback(null, mutex.continue);
                }, function isolated(callback){
                    DB.exists(keyurlclient2, function(err, data) {
                        if (data){
                            // inc le nb de pooler
                           //DB.incr(keyurlclient2,function(){});
                           //check si un flux de pooler
                           //var subpushch = prefix+listener+":"+clientid+":"+appid+":"+channel;
                           DB.get(ch,function (err,elt){
                               if (elt){
                                   /*if(elt != "1"){
                                       try{
                                            socket.emit('message', elt);
                                       }catch(e){
                                       }
                                   }else{
                                        env.log.debug("FILE:jast_socket.js","Feeds exist but empty "+subpushch);
                                   }*/
                               }else{
                                   publishp = redis_emmitter.createPublish();
                                   publishp.publish(admin_channel,"message",channel,m2);
                                   publishp = null;
                               }
                               callback(null,"pooler exist");
                           });
                        }else{
                           // create pooler log
                            DB.set(keyurlclient2, url, function(elt) {
                                // send data to admin
                                env.log.debug("FILE:jast_socket.js","push direct redis to "+ admin_channel);
                                publishp = redis_emmitter.createPublish();
                                publishp.publish(admin_channel,"message",channel,m2);
                                publishp = null;
                                //DB.set(clientapppooler, 1, function(elt) {
                                callback(null,"pooler create");
                                //});
                            });
                            // define the pooler id
                        }
                    });
                }, function after(err, result) {

                });
            }
        });
    });
    next();
};