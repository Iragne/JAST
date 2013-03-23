

module.exports = function (app,redis_req,database,crypto,DB){
	var login_action = function (login,passe,callback){
       if (login == null || passe == null)
           return callback(false,0);
        database.Users.find({ where: {username: login,password:crypto.createHash('sha1').update(passe).digest('hex')} }).success(function(user) {
            callback(user != null,user);
        }).error(function (e){
            console.log("error");
            console.log(e);
            callback(false,0);
        });
        
    };
    app.post('/admin/auth/login', function (req, res) {
        login = req.body.login.replace(/\W/g, '');
        passe = req.body.password.replace(/\W/g, '');
        login_action(login,passe,function (respond,user){
            if(respond){
              req.session.auth = {client:user.ClientId,user:user};
              res.redirect('/admin/apps/'+user.ClientId);
            }else
              res.render('auth/login', respond);
        });
        
    });
    app.get('/admin/auth/login', function (req, res) {
        login_action(null,null,function (respond){
            res.render('auth/login', respond);
        });
    });
    
    
    
    app.get('/admin/auth/logout', function (req, res) {
        if (req.session)
          req.session.destroy();
        return res.redirect('/admin/auth/login');
    });
}