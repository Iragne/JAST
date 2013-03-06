var Sequelize = require('Sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Application', {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        bundle: Sequelize.STRING,
        active: Sequelize.INTEGER
    });
}