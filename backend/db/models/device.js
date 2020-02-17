//const Sequelize = require("sequelize");
const { database } = require("../sequelize");
const { configuration } = require("./configuration");
const skeleton = require('./../skeletons/device');

const device = database.define(skeleton.name, skeleton.skeleton, skeleton.options);
/*
device.sync({force:true}).then(function () {
    return device.create({
        name: 'test3',
    });
});
*/



module.exports = {
    device: device
};