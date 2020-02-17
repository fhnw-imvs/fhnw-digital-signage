const Sequelize = require("sequelize");
const { database } = require("../sequelize");
const skeleton = require('./../skeletons/urlcfgjunction');

const urlcfgjunction = database.define(skeleton.name, skeleton.skeleton, skeleton.options);

/*
url.sync().then(function () {
    return url.create({
        url: 'www.lachenistgesunds.com',
        description: 'damit man lachen kann'
    });
});
*/
module.exports = {
    urlcfgjunction
};