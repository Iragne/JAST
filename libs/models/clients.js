var Sequelize = require('Sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Clients', {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        email: Sequelize.STRING,
        enable: Sequelize.STRING,
        master: Sequelize.STRING
    });
}