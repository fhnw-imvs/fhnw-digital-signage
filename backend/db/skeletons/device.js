const Sequelize = require("sequelize");
//const { configuration } = require("./../models/configuration");

module.exports = {
    name: 'device',
    skeleton: {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        configurationId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'configuration',
                key: 'id'
            }
        },
        name: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            defaultValue: '-'
        },
        mac: {
            type: Sequelize.STRING,
            defaultValue: 'NOT SET'
        },
        approved: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        registered: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: new Date()
        },
        approvaltime: {
            type: Sequelize.DATE,
            allowNull: true
        },
        apikey: {
            type: Sequelize.STRING(512),
            allowNull: true,
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date()
        },
    },
    options: {
        freezeTableName: true // Model tableName will be the same as the model name
    }
};