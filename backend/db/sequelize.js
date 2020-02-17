const { Sequelize } = require("sequelize");

console.log("ENVIRONMENT USED: " + process.env.NODE_ENV);

let host, port, username, db, pw;
if (process.env.NODE_ENV === "production") {
    db = process.env.MYSQL_DATABASE;
    username = process.env.MYSQL_USERNAME;
    host = process.env.MYSQL_HOSTNAME;
    port = process.env.MYSQL_PORT;
    pw = process.env.MYSQL_PASSWORD;
} else {
    username = 'usr';
    host = '127.0.0.1';
    port = 3306;
    db = 'dev';
    pw = 'secrety'
}

const database = new Sequelize(db, username , pw, {
    //host: host,
    dialect: 'mysql',
    port: port,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

database.authenticate()
    .then(() => console.log('MySQL connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to MySQL:', err));

module.exports = {
    database: database
};