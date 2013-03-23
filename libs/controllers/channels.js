module.exports = function (app,redis_req,database,crypto,DB){
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
    app.get('/admin/apps/channel/:appid', function (req, res) {
        var appid = req.params.appid.replace(/\W/g, '');
        database.Applications.find(appid).success(function(app){
            key = app.ClientId+":"+app.id+':'+'*';
            //console.log(key);
            DB.keys(key, function(err, data) {
                //console.log(data);
                res.render('apps/channel', {flux:data,a:app,session:req.session.auth});
            });
        });
    });

};