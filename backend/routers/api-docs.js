const express = require('express');
const router = express.Router();
const { validationResult} = require("express-validator");
const validators = require("../db/validators");
/*
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

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const specs = swaggerJsdoc(options);
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
const validateAuthentication = (req, res, next) => {
    if (!process.env.NODE_ENV === "development" && !validationResult(req).isEmpty())
        return res.status(422).json({errors: validationResult(req).array()});
    next();
};

// serve swagger
router.use('/', swaggerUi.serve, swaggerUi.setup(specs));
*/
module.exports = router;