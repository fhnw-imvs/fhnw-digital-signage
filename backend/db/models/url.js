const Sequelize = require("sequelize");
const { database } = require("../sequelize");
const skeleton = require('./../skeletons/url');

const url = database.define(skeleton.name, skeleton.skeleton, skeleton.options);

/*
url.sync().then(function () {
    return url.create({
        url: 'www.lachenistgesunds.com',
        description: 'damit man lachen kann'
    });
});
*/
module.exports = {
    url
};