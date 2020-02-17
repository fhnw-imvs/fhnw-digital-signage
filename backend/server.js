const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const port = process.env.PORT || 1337;
const app = express();
const bodyParser = require('body-parser');

const helmet = require('helmet');
app.use(helmet());

require('dotenv').config();
//init db
require('./db/sync');

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, bearer");
    next();
});

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            title: 'Mgmt app API',
            version: '1.0.0',
            description: 'API definition',
        },
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                description: 'JWT authorization for API',
                name: 'bearer',
                in: 'header',
            },
        },
    },
    apis: ['./routers/*.js'],
};

const { validationResult} = require("express-validator");
const validators = require("./db/validators");

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const specs = swaggerJsdoc(options);

const validateAuthentication = (req, res, next) => {
    if (!process.env.NODE_ENV === "development" && !validationResult(req).isEmpty())
        return res.sendStatus(401);
    next();
};

app.use('/api-docs', validators.auth, validateAuthentication, function(req, res, next){
    specs.host = req.get('host');
    req.swaggerDoc = specs;
    next();
}, swaggerUi.serve, swaggerUi.setup());


app.use(express.static(path.join(__dirname, 'mgmt_app_server_frontend/build')));
const device = require('./routers/device');
const configuration = require('./routers/configuration');
const ext = require('./routers/ext');
const user = require('./routers/user')
const auth = require('./routers/auth');
app.use('/api/device', device);
app.use('/api/configuration', configuration);
app.use('/api/user', user);
app.use('/api/ext', ext);
app.use('/api/auth', auth);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, "mgmt_app_server_frontend", "build", 'index.html')));

const cors = require('cors');
app.use(cors());

// handle certificate
let credentials = "";
if(process.env.NODE_ENV === "production" && process.env.HOSTNAME !== "") {
    const privateKey = fs.readFileSync('sslcert/'+process.env.HOSTNAME+'/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('sslcert/'+process.env.HOSTNAME+'/cert.pem', 'utf8');
    const ca = fs.readFileSync('sslcert/'+process.env.HOSTNAME+'/chain.pem', 'utf8');

    credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
} else {
    credentials = {
        key: fs.readFileSync(path.resolve(__dirname, 'sslcert/server.key'), 'utf8'),
        cert: fs.readFileSync(path.resolve(__dirname, 'sslcert/server.cert'), 'utf8')
    };
}

//app.use(favicon(prodDir + "/favicon.ico"));

if(process.env.NODE_ENV === "development") {
    http.createServer(app).listen(port, "0.0.0.0", () => console.log(`Listening on port ${port}`));
} else {
    app.use((req, res, next) => {
        if(!req.secure) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        next();
    });
    https.createServer(credentials, app).listen(port, "0.0.0.0", () => console.log(`Listening on port ${port}`));
}


module.exports = {
    //statusCache
};
