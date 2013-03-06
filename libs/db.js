var Sequelize = require('Sequelize'),
    crypto = require('crypto');


var  sequelize = new Sequelize('jast', 'root', 'toto', {
    // custom host; default: localhost
    host: 'localhost',
     
    // custom port; default: 3306
    port: 3306,
     
    // custom protocol
    // - default: 'tcp'
    // - added in: v1.5.0
    // - postgres only, useful for heroku
    protocol: 'tcp',
     
    // disable logging; default: console.log
    logging: console.log,
     
    // max concurrent database requests; default: 50
    maxConcurrentQueries: 100,
     
    // the sql dialect of the database
    // - default is 'mysql'
    // - currently supported: 'mysql', 'sqlite', 'postgres'
    dialect: 'mysql',
     
    // the storage engine for sqlite
    // - default ':memory:'
    //storage: 'path/to/database.sqlite',
     
    // disable inserting undefined values as NULL
    // - default: false
    //omitNull: true,
     
    // Specify options, which are used when sequelize.define is called.
    // The following example:
    // define: {timestamps: false}
    // is basically the same as:
    // sequelize.define(name, attributes, { timestamps: false })
    // so defining the timestamps for each model will be not necessary
    // Below you can see the possible keys for settings. All of them are explained on this page
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
     
    // similiar for sync: you can define this to always force sync for models
    sync: { force: false },
     
    // sync after each association (see below). If set to false, you need to sync manually after setting all associations. Default: true
    syncOnAssociation: true,
     
    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: { maxConnections: 10, maxIdleTime: 30}
});

var Applications = sequelize.import(__dirname + "/models/applications"),
    Clients = sequelize.import(__dirname + "/models/clients"),
    Users = sequelize.import(__dirname + "/models/users");



Clients.hasMany(Users, { as: 'Admin' });
Clients.hasMany(Applications,{ as: 'Applications' });


Applications.sync();
Clients.sync();
Users.sync();






try{
  var defaultclient = Clients.build({
        id: 1,
        name: 'JASTTestClient',
        description: 'JAST test project',
        username: 'admin',
        password: crypto.createHash('sha1').update('admin').digest('hex'),
        email: 'contact@gmail.com'
    }).success(function(e){});
    
    var admin = Users.build({
        id: 1,
        username: 'admin',
        password: crypto.createHash('sha1').update('admin').digest('hex'),
        email: 'contact@gmail.com'
    }).success(function(e){});
    defaultclient.addAdmin(admin).success(function(e){});
    defaultclient.save().success(function(e){});
}catch(e){
    
}



module.exports.sequelize = sequelize;
module.exports.Applications = Applications;
module.exports.Clients = Clients;
module.exports.Users = Users;