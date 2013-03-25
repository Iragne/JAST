HOST = process.argv[2] || "127.0.0.1",
PORT =  process.argv[3] || "4242";
key_admin =  process.argv[4] || "7c7b2bfaa4ee4094b390e94c2212aed04326871c";

var http = require("http"),
    diff_match_patch=require('jajsondiff'),
    EventEmitter = require('events').EventEmitter,
    crypto = require('crypto');

var ssss = function (){
//    console.log("HOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOO")
    var socket2 = require('socket.io-client').connect('http://localhost:4242/ns',{'force new connection': true});
    socket2.on('error', function(e){
        console.log("error test")
        console.log(e)
    });
    socket2.on('connect', function () {
//        console.log("********************************RRRR**************************************");
    //    console.log("********************************RRRR**************************************");
        socket2.on('disconnect', function(){
            console.log("********************************dec**************************************");
        });
        socket2.on('message', function(data){
            //console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            //console.log(data);
        });
        //key_admin = '7c7b2bfaa4ee4094b390e94c2212aed04326871c'
        var data = {client:1, key: key_admin, app:2,channel:"adelskott",url:"http://search.twitter.com/search.json?q=adelskott&rpp=5&include_entities=true&result_type=recent",ttl:1};
        //console.log(data)
        socket2.emit('psubscribe', data);
    });
}


var test2 = function (){
//    console.log("HOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOO")
    var socket2 = require('socket.io-client').connect('http://localhost:4242/ns',{'force new connection': true});
    socket2.on('error', function(e){
        console.log("error test")
        console.log(e)
    });
    socket2.on('connect', function () {
//        console.log("********************************RRRR**************************************");
    //    console.log("********************************RRRR**************************************");
        socket2.on('disconnect', function(){
            console.log("********************************dec**************************************");
        });
        socket2.on('message', function(data){
            //console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            //console.log(data);
        });
        //key_admin = '7c7b2bfaa4ee4094b390e94c2212aed04326871c'
        var data = {client:1, key: key_admin, app:2,channel:"marseille",url:"http://www.thefanclub.com/marseille.ijson",ttl:1};
        //console.log(data)
        socket2.emit('psubscribe', data);
    });
}

setTimeout(ssss, 4000);
setTimeout(test2, 4000);

