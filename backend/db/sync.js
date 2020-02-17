require("./sequelize");

const {user} = require("./models/user");
const {registration} = require("./models/registration");
const {configuration} = require("./models/configuration");
const {url} = require("./models/url");
const {device} = require("./models/device");

configuration.hasMany(device, {foreignKey: 'configurationId'});
device.belongsTo(configuration, {foreignKey: 'configurationId'});


url.belongsToMany(configuration, {through: 'urlcfgjunction', foreignKey: 'urlId', otherKey: 'configurationId'});
configuration.belongsToMany(url, {through: 'urlcfgjunction', foreignKey: 'configurationId', otherKey: 'urlId'});


registration.findOne().then(r => {
    console.log("fetched PSK: "+r.registerkey);
    require('./../tools/global').REGISTERKEY = r.registerkey;
    console.log("set PSK: "+require('./../tools/global').REGISTERKEY);
}).catch(error => console.error(error));
