const Sequelize = require("sequelize");

module.exports = {
    name: 'registration',
    skeleton: {
        id: {
            type: Sequelize.INTEGER,
                unique: true,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
        },
        registerkey: {
            type: Sequelize.STRING,
                unique: true,
                allowNull: false,
        },
        altered: {
            type: Sequelize.DATE,
                allowNull: false,
                defaultValue: new Date()
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