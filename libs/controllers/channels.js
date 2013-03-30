var crypto = require('crypto'),
    database =  require('../db.js'),
    config = require("../../conf.js");


module.exports = function (app,DB){

    const version = config.jast.version || "1";
    const namespace = config.jast.namesapce || "jast";
    const listener = config.jast.namesapcelistener || "Feeds";
    const prefix = "/"+version+"/"+namespace+"/";
    

    app.get('/admin/apps/channel/listen/:appid/:chname', function (req, res) {
        var chname = req.params.chname;
        chname = chname.split(":");
        chname.shift()
        chname.shift()
        chname = chname.shift()
        var appid = req.params.appid.replace(/\W/g, '');
        database.Applications.find(appid).success(function(app){
        
            var ap = {client:app.ClientId, key: app.secretkey, app:app.id,channel:chname};//JSON.stringify({key_admin: app.secretkey,client_admin:1,app_admin:app.id});
           
            res.render('apps/listen', {a:ap,channel:chname,session:req.session.auth});
        });     
        
    });
    app.get('/admin/apps/channels/:appid', function (req, res) {
        var appid = req.params.appid.replace(/\W/g, '');
        database.Applications.find(appid).success(function(app){
            key = prefix+listener+":"+app.ClientId+":"+app.id+':'+'*';
            console.log(key);
            DB.keys(key, function(err, data) {
                //console.log(data);
                tab = []
                for (var i = 0; i < data.length; i++) {
                    a = data[i].replace(prefix+listener+":","")
                    tab.push(a)
                };
                res.render('apps/channel', {flux:tab,a:app,session:req.session.auth});
            });
        });
    });

};