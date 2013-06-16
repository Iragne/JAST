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

var http = require("http"),
    diff_match_patch=require('jajsondiff'),
    EventEmitter = require('events').EventEmitter,
    config = require("../conf.js"),
    crypto = require('crypto'),
    env = require("./env.js"),
    urlparse = require('url');


var RedisEmitter_events = new EventEmitter();

var dmp =new diff_match_patch.difftext();
var jsondiffpatch =  diff_match_patch.diffjson;
jsondiffpatch.config.textDiffMinLength = 5;

RedisEmitter_events.setMaxListeners(10000000);

RedisEmitter_events.on("error",function(e){
    env.log.debug("EvEmit");
    env.log.debug(e);
});

var socket = null;
var channel_emmit = function (){
        
        var url = 'http://'+config.poolers.server+':'+config.express.port+'/'+config.express.websocket
        env.log.debug("Channel admin Listen "+url)
        if (socket == null)
            socket = require('socket.io-client').connect(url,{'force new connection': true});
        socket.on('error', function(e){
            env.log.error("error admin channel")
            env.log.error(e)
        });
        socket.on('connect', function () {
            env.log.debug("admin channel connected");
            socket.on('disconnect', function(){
                env.log.debug("disconenct admin channel")
            });
            RedisEmitter_events.on('pooler_message',function(data){
                env.log.debug('pooler_message')
                socket.emit('publish', data,function (){
                
               }); 
            });
        });
    
}
exports.run = function(conf){
//    return;    
    channel_emmit();
    var key_admin = conf.key_admin || '4dc31927dc719858c134d09b5941fe6db7ec6606';
    var client_admin = conf.client_admin || 1;
    var app_admin = conf.app_admin || 1;

    var url = 'http://'+config.poolers.server+':'+config.express.port+'/'+config.express.websocket;
    var socket_listen = require('socket.io-client').connect(url,{'force new connection': true});
    socket_listen.on('error', function(e){
            env.log.error("NO Connection for admin channel " + url)
            env.log.error(e)
    });
    socket_listen.on('connect', function () {
        env.log.info("Listen connected")
        socket_listen.on('disconnect', function(e){
            env.log.debug("Disconenct Pooler")
        });
        socket_listen.on('killpooler',function (datae){
            var datakey = JSON.parse(datae)
            RedisEmitter_events.emit(datakey.data.channel,datakey)
        });
        socket_listen.on('message',function (datae){ 
            var data = null;
            var datakey = null;
            try{
                datakey = JSON.parse(datae)
                data = JSON.parse(datakey.data)
            }catch(e){
                env.log.error("Can't convert to JSON")
                env.log.error(e)
            }
            env.log.info("Create POOLER url: "+data.url + " TTL: "+data.ttl + " c:"+data.clientid + " a:"+data.appid+" ch:"+data.channel)
            
            var url = data.url;
            var ttl = data.ttl;
            if (ttl  == 0)
                ttl = 1;
            var channel = data.channel;//crypto.createHash('sha1').update(url).digest('hex');
            var clientid = data.clientid;
            var appid = data.appid;
            var keysecret = data.keysecret;
            var olddata = null;
            var olddata_json = null;
            var stop = false;
            
            var request = null;
            var timer = null;
            var getRestData = function (){
                env.log.info("getdata "+url)
                request = http.get(urlparse.parse(url), function(res){
                    var body = ''
                    res.setEncoding('binary');
                    res.on('data', function(chunk){body += chunk;});
                    res.on('end', function(){
                        if (stop)
                            return;
                        if (body != olddata || olddata == null){
                            olddata = body;
                            try{
                                body = JSON.parse(body)
                            }catch (e){
                                env.log.error("Pas json")
                                env.log.error(e)
                            }
                            
                            RedisEmitter_events.emit('pooler_message',{client:clientid,
                                                                       key: keysecret,
                                                                       app:appid, 
                                                                       message:body,
                                                                       channel:channel});
                        }
                        if (!stop)
                            timer = setTimeout(getRestData,ttl*1000);
                    });
                    
                    res.on("error",function (e) {
                        env.log.error("ERROR SOCKET");
                        env.log.error(e);
                        if(!stop)
                            timer= setTimeout(getRestData,ttl*1000);
                    });
                });
                request.on("error",function (e) {
                    env.log.error("ERROR SOCKET");
                    env.log.error(e);
                    //stop = true;
                });
            };
            if(!stop)
                getRestData();
            var event_ch = "/"+config.jast.version+"/"+config.jast.namespace+"/"+config.jast.namesapcelistener+":"+clientid+":"+appid+":"+channel;
            function killreq(){
                env.log.info("try to kill it")
                stop = true;
                request.abort()
                clearTimeout(timer)
                RedisEmitter_events.removeListener(event_ch,killreq)
            }
            RedisEmitter_events.on(event_ch,killreq)
        });
        data = {client:client_admin, key: key_admin, app:app_admin,channel:"admin_channel"};
        socket_listen.emit('psubscribe', data,function (e){
            env.log.debug(e)
        });
    });
}

//jsondiffpatch.config.diff_match_patch = require('./diff_match_patch_uncompressed.js');

// use text diff for strings longer than 5 chars 


///var d = jsondiffpatch.diff({ age: 5, name: 'Arturo' }, {age: 7, name: 'Armando' });





/*


                if (body != olddata){

                        if (olddata){
                            var d = dmp.patch_make(body, olddata);
                            //var jsondiff = ''
        //                    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
        //                    console.log(d)
                            try {
        //                        feeds = JSON.parse(body);
        //                        var diffj = jsondiffpatch.diff(olddata_json,feeds);
        //                        json_data2 = JSON.stringify(diffj);
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                                //json_data = JSON.stringify(d);
                                json_data = dmp.patch_toText(d) //d.toString()
        //                        if (json_data2.length < json_data.length){
        //                            json_data = json_data2;
        //                        }
        //                        console.log(json_data)
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                                //jsondiff = json_data;
                                
                                //clean = dmp.patch_apply(dmp.patch_fromText(json_data), olddata) 
        //                        console.log(clean[0])
        //                        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                            }catch(e){
                                console.log("My error stringify")
                                console.log(e)
                            }
        //                    console.log(json_data.length + " < "+body.length)
                            if (json_data.length < body.length){
                                console.log("diff sent")
                                olddata = body;
                                body = json_data
                            }
        //                    console.log(body);
                        }else{
                            olddata = body;
                            try{
                                feeds = JSON.parse(body);
                                olddata_json = feeds;
                            }catch(e){
                                console.log("My error stringify")
                                console.log(e)
                            }
                        }
                        
                        
*/


