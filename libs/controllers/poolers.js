var crypto = require('crypto'),
    database =  require('../db.js'),
    config = require("../../conf.js");


module.exports = function (app,DB){

    const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
    

    app.get('/admin/poolers/:clientid', function (req, res) {
        var clientid = req.params.clientid.replace(/\W/g, '');
        console.log("fdsqfqsdf")
        key = prefix+"Poolers"+":"+req.session.auth.client+':'+'*';
        console.log(key);
        var list = [];
        DB.keys(key, function(err, datas) {
            if (datas){
                console.log(datas)
                for (var i = 0; i < datas.length; i++) {
                    var ee = datas[i];
                    DB.get(ee,function(err,data){
                        var e = ee.split(':')
                        e.shift()
                        e.shift()
                        var app = e.shift();
                        var ch = e.shift();
                        list.push({appid:app,channel:ch,url:data});
                        console.log(list)
                        if (i == datas.length)
                           res.render('poolers/list', {flux:list,session:req.session.auth}); 
                    });

                }
                if (0 == datas.length)
                    res.render('poolers/list', {flux:list,session:req.session.auth}); 
            }
                
            
        });
        
    });
};