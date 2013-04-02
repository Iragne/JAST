var Sequelize = require('sequelize'),
    crypto = require('crypto'),
    config = require("../conf.js"),
    env = require("./env.js");



var run = function (next){
    var  sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
        host: config.mysql.host,
        port: config.mysql.port,
        protocol: 'tcp',
        logging:function(){
            var ar = ["[SQL]     "];
            var ar = ar.concat([arguments['0']])
            env.log.debug.apply(env.log,ar)
        },
        maxConcurrentQueries: 100,
        dialect: 'mysql',
        define: {
            underscored: false,
            freezeTableName: false,
            syncOnAssociation: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
    //        classMethods: {method1: function() {}},
    //        instanceMethods: {method2: function() {}},
            timestamps: true
        },
        sync: { force: false },
        syncOnAssociation: true,
        pool: { maxConnections: 10, maxIdleTime: 30}
    });
    
    var Applications = sequelize.import(__dirname + "/models/applications"),
        Clients = sequelize.import(__dirname + "/models/clients"),
        Users = sequelize.import(__dirname + "/models/users");
    
    
    
    Clients.hasMany(Users, { as: 'Admin' });
    Clients.hasMany(Applications,{ as: 'Applications' });
    
    Clients.sync().success(function() {
        Users.sync().success(function() {
            Applications.sync().success(function() {
                // woot woot
                env.log.debug("******************************************************************************");
                try{
                  var defaultclient = Clients.build({
                        id: 1,
                        name: 'JASTadmin',
                        description: 'JAST test project',
                        username: 'admin',
                        password: crypto.createHash('sha1').update('admin').digest('hex'),
                        email: 'contact@gmail.com',
                        enable:1,
                        master:1
                    });
                    
                    defaultclient.save().success(function(e){}).error(function(){});
                    
                    var admin = Users.build({
                        id: 1,
                        username: 'admin',
                        password: crypto.createHash('sha1').update('password').digest('hex'),
                        email: 'contact@gmail.com',
                        ClientId: 1
                    }).save().success(function(e){}).error(function(){});
                    
                    Applications.build({
                        id: 1,
                        name: 'Privatepooler',
                        description: 'Admin channel',
                        bundle: '',
                        secretkey: crypto.createHash('sha1').update((new Date().getTime())+config.jast.secretkey).digest('hex'),
                        active: 1,
                        ClientId: 1
                    }).save().success(function(e){
                        
                        
                    }).error(function(){});
                    
                    next();
                }catch(e){
                    env.log.error("******************************************************************************");
                    env.log.error(e)
                }        
            }).error(function(error) {
            // whooops
            })
        }).error(function(error) {
        // whooops
        })
    }).error(function(error) {
    // whooops
    });
    
    
    
    
    
    
    
    module.exports.sequelize = sequelize;
    module.exports.Applications = Applications;
    module.exports.Clients = Clients;
    module.exports.Users = Users;
    

    
}

module.exports.run = run;
