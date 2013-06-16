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

var Sequelize = require('sequelize'),
    crypto = require('crypto'),
    config = require("../conf.js"),
    env = require("./env.js");



var run = function (next){
    "use strict";
    var  sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
        host: config.mysql.host,
        port: config.mysql.port,
        protocol: 'tcp',
        logging:function(){
            var ar = ["[SQL]     "];
            ar = ar.concat([arguments['0']]);
            env.log.debug.apply(env.log,ar);
        },
        maxConcurrentQueries: 100,
        dialect: 'mysql',
        define: {
            underscored: false,
            freezeTableName: false,
            syncOnAssociation: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
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
                        active: 1,
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
                    env.log.error(e);
                }
            }).error(function(error) {
            // whooops
            });
        }).error(function(error) {
        // whooops
        });
    }).error(function(error) {
    // whooops
    });

    module.exports.sequelize = sequelize;
    module.exports.Applications = Applications;
    module.exports.Clients = Clients;
    module.exports.Users = Users;
};

module.exports.run = run;



