module.exports = function (app,redis_req,database,crypto,DB,options){
    const version = options.version || "1";
    const namespace = options.namesapce || "jast";
    const prefix = "/"+version+"/"+namespace+"/";

	app.get('/admin/apps/del/:appid', function (req, res) {
    	var appid = req.params.appid.replace(/\W/g, '');
    	database.Applications.find(appid).success(function(app){
        	if (app && appid != 1){
            	app.destroy().success(function () {
            	});
        	}
        	res.redirect('/admin/apps/'+req.session.auth.client);
    	});
	});
	app.get('/admin/apps/details/:appid', function (req, res) {
    	var appid = req.params.appid.replace(/\W/g, '');
    	database.Applications.find(appid).success(function(app){
        	res.render('apps/add', {flux:app,session:req.session.auth});
    	});
		
	});
	
	app.get('/admin/poolers/:client', function (req, res) {
    	var client = req.params.client.replace(/\W/g, '');
       	res.render('apps/poolers', {flux:null,session:req.session.auth});
	});
	
	app.post('/admin/apps/add', function (req, res) {
        var data = req.body.app;
        data.ClientId = req.session.auth.client;
        data.active = parseInt(data.active);
        database.Applications.build(data).saveorupdate(function(model){
            if (model.active == 1){
                DB.sadd(prefix+"Clients",model.ClientId);
                DB.sadd(prefix+"Apps",model.ClientId+":"+model.id);
                DB.sadd(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }else{
                DB.srem(prefix+"Clients",model.ClientId);
                DB.srem(prefix+"Apps",model.ClientId+":"+model.id);
                DB.srem(prefix+"Apps:"+model.ClientId,model.id);
                DB.srem(prefix+"AppsKey",model.ClientId+":"+model.id+":"+model.secretkey);
            }
            return res.redirect('/admin/apps/'+req.session.auth.client);
        });
	});
	app.get('/admin/apps/add', function (req, res) {
        res.render('apps/add', {flux:{},session:req.session.auth});
	});
	
	app.get('/admin/apps/:client', function (req, res) {
    	var client = req.params.client.replace(/\W/g, '');
    	
    	database.Applications.findAll({where:{ClientId:req.session.auth.client}}).success(function(apps){
    	   res.render('apps/list', {flux:apps,session:req.session.auth});
    	});
	});
}
