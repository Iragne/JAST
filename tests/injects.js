HOST = process.argv[2] || "127.0.0.1",
PORT =  process.argv[3] || "80";
key_admin =  process.argv[4] || "1787db1a41077033b72e3ec9393db4b4baf04f50";
nbinjector =  process.argv[5] || "4";
nbconcurent =  process.argv[6] || "4";

var http = require("http"),
    EventEmitter = require('events').EventEmitter,
    crypto = require('crypto');

var ssss = function (){
//    console.log("HOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOO")
    var socket2 = require('socket.io-client').connect('http://'+HOST+':'+PORT+'/ns',{'force new connection': true});
    socket2.on('error', function(e){
        console.log("error test");
        console.log(e);
    });
    socket2.on('connect', function () {
//        console.log("********************************RRRR**************************************");
    //    console.log("********************************RRRR**************************************");
        socket2.on('disconnect', function(){
            console.log("********************************dec**************************************");
        });
        socket2.on('message', function(data){
            console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            data2 = JSON.parse(data);
            console.log(data2.data.results);
        });
        //key_admin = '7c7b2bfaa4ee4094b390e94c2212aed04326871c'
        var data = {client:1, key: key_admin, app:2,channel:"adelskott",url:"http://search.twitter.com/search.json?q=sexy&rpp=5&include_entities=true&result_type=recent",ttl:10};
        //console.log(data)
        socket2.emit('psubscribe', data);
    });
};


var test2 = function (){
//    console.log("HOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOOHOOOOOOOOOOOOOO")
    var socket2 = require('socket.io-client').connect('http://'+HOST+':'+PORT+'/ns',{'force new connection': true});
    socket2.on('error', function(e){
        console.log("error test");
        console.log(e);
    });
    socket2.on('connect', function () {
//        console.log("********************************RRRR**************************************");
    //    console.log("********************************RRRR**************************************");
        socket2.on('disconnect', function(){
            console.log("********************************dec**************************************");
        });
        socket2.on('message', function(data){
            console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            //console.log(data);
        });
        //key_admin = '7c7b2bfaa4ee4094b390e94c2212aed04326871c'
        var data = {client:1, key: key_admin, app:2,channel:"marseille",url:"http://cfc.c-cast.tv/WsIntegrator.svc/wlabel/episode/6",ttl:5};
        //console.log(data)
        socket2.emit('psubscribe', data);
    });
};
nbinjector =  process.argv[5] || "4";
nbconcurent =  process.argv[6] || "4";

for (var i = 0; i < parseInt(nbinjector); i++) {
    setTimeout(function(){
        for (var j = 0; j < parseInt(nbconcurent); j++) {
            //setTimeout(ssss, 1000);
            setTimeout(test2, 1000);
        }
    },i*1000+1000);
}





