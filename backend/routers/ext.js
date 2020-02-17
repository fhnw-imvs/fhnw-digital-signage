const { authenticate } = require("../tools/helpers");
const { database } = require("../db/sequelize");
const { validationResult} = require("express-validator");
const { device }  = require("../db/models/device");
const { url }  = require("../db/models/url");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();
const { registration } = require("../db/models/registration");
const { configuration } = require("../db/models/configuration");
const jwt = require('jsonwebtoken');

//let cache = [{id: "", dates: [], image: ""}];
let cache = new Map();

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Device triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/ext/status/:id:
 *   get:
 *     tags:
 *       - device
 *         extension
 *     description: Get Status of device, returns 8-10 timestamps which can be used to evaluate health of the device
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: id
 *         type: integer
 *         description: Device id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: Status sent
 *       401:
 *         description: Unauthorized, bad bearer header
 *       404:
 *         description: Device was not found
 *       422:
 *          description: malformed request, see error array in response
 *       500:
 *         description: server-side error
 */
router.get('/status/:id', [validators.auth, validators.extGETStatus], (req, res) => {
    if(!handleValidation(req, res)) return;
    return cache.has(req.params.id)
        ? res.json(cache.get(req.params.id))
        : res.sendStatus(404);
});
/**
 * @swagger
 * /api/ext/status/:
 *   get:
 *     tags:
 *       - device
 *         extension
 *     description: Get Status of all devices, returns also 8-10 timestamps which can be used to evaluate health of the device
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Status sent
 *       401:
 *         description: Unauthorized, bad bearer header
 *       422:
 *          description: malformed request, see error array in response
 *       500:
 *         description: server-side error
 */
router.get('/status', [validators.auth], (req, res) => {
    if(!handleValidation(req, res)) return;
    console.log("sending complete cache");
    console.log(cache);

    return typeof cache === 'undefined'
        ? res.sendStatus(404)
        : res.json([...cache.values()]);
});
/**
 * @swagger
 * /api/ext/configuration/:id:
 *   get:
 *     tags:
 *       - device
 *         extension
 *     description: Get configuration of device
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: id
 *         type: integer
 *         description: Device id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: Status sent
 *       401:
 *         description: Unauthorized, bad bearer header
 *       404:
 *         description: Device was not found
 *       422:
 *          description: malformed request, see error array in response
 *       500:
 *         description: server-side error
 */
router.get('/configuration/:id', [validators.extGETConfiguration], (req, res) => {
    if(!handleValidation(req, res)) return;

    return device.findOne({where: {id: req.params.id}, attributes: ['id'],
        include: [{
            model: configuration,
            attributes: ['reloadtime', 'cycletime'],
            include: [{model:url, attributes: ['url'], through: {attributes: []}}],
        }]}).then(d => res.json(d))
        .catch(e => {
            console.error(e);
            res.sendStatus(500);
        });
});
/**
 * @swagger
 * /api/ext/status:
 *   post:
 *     tags:
 *       - device
 *         extension
 *     description: Send Status of device to backend
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: id
 *         type: integer
 *         description: Device id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: Status sent
 *       401:
 *         description: Unauthorized, bad bearer header
 *       404:
*          description: device id not found
 *       422:
*          description: malformed request, see error array in response
 *       500:
 *         description: server-side error
 */
router.post('/status', [validators.extPOSTStatus], (req, res) => {
    if(!handleValidation(req, res)) return;
    console.log("INFORMATION: new status for caching");
    if(!cache.has(req.body.id)){
        cache.set(req.body.id, {
            id: req.body.id,
            responses: [Date.now()],
            errors_array: req.body.errors_array ? req.body.errors_array : null,
            snapshot_timestamp: req.body.snapshot_timestamp ? req.body.snapshot_timestamp : null,
            snapshot_base64: req.body.snapshot_base64 ? req.body.snapshot_base64 : null,
            ip: req.connection.remoteAddress
        });
    } else {
        console.log("setting status id " + req.body.id);
        let tmp = cache.get(req.body.id);
        if(tmp.responses.length > 10){
            tmp.responses.shift();
            tmp.responses.shift();
        }
        tmp.id = req.body.id;
        tmp.responses.push(Date.now());
        tmp.errors_array = req.body.errors_array ? req.body.errors_array : null;
        tmp.snapshot_timestamp = req.body.snapshot_timestamp ? req.body.snapshot_timestamp : null;
        tmp.snapshot_base64 = req.body.snapshot_base64 ? req.body.snapshot_base64 : null;
        tmp.ip = req.connection.remoteAddress

        cache.set(req.body.id, tmp);
    }

    res.sendStatus(200);
});
/**
 * @swagger
 * /api/ext/register:
 *   post:
 *     tags:
 *       - device
 *         extension
 *     description: Register device
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         type: string
 *         description: Device name for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned with
 *       401:
 *         description: unauthorized, bad authorization header
 *       422:
 *          description: malformed request, see error array in response
 *       500:
 *         description: server-side error
 */
router.post('/register', validators.deviceRegister, (req, res) => {
    console.log('new register request');

    if(!handleValidation(req, res)) return;

    return registration.findOne().then(registration => {
        require("./../tools/global").REGISTERKEY = registration.registerkey;
        console.log("fetched PSK");
        if (!authenticate(req.headers["authorization"], registration.registerkey, req.body))
            return res.sendStatus(401);

        res.header['authorization'] = req.headers["authorization"];
        return device.create({
            name: req.body.name,
            description: req.body.description,
            approved: false
        }).then(device => res.json({device: device}))
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
    }).catch((e) => {
        console.error(e);
        res.sendStatus(500);
    });
});
/**
 * @swagger
 * /api/ext/awaitapprove/:id:
 *   get:
 *     tags:
 *       - device
 *         extension
 *     description: Check if device approved
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: id
 *         type: integer
 *         description: Device id, must exist
 *         required: true
 *     responses:
 *       200:
 *          description: body returned with jwt token and device id
 *       202:
 *          description: indicates device is registered but still not approved
 *       401:
 *          description: unauthorized, bad bearer header
 *       404:
 *          description: device not found
 *       422:
 *          description: malformed request, see error array in response
 *       500:
 *          description: server-side error
 */
router.get('/awaitapprove/:id', validators.deviceAwaitAppprove, (req, res) => {
    console.log('new request awaitapprove:');

    console.log("fetched PSK");
    if (!handleValidation(req, res)) return;


    return database.transaction(t =>
        registration.findOne({transaction: t}).then(registration => {
            require("./../tools/global").REGISTERKEY = registration.registerkey;
            console.log("fetched PSK looking for id:" + req.params.id);
            //find approved device if present
            if (!authenticate(req.headers["authorization"], registration.registerkey, req.body))
                return res.sendStatus(401);

            return device.findOne({
                where: {
                    id: req.params.id,
                    approved: true,
                    apikey: null
                }, transaction: t}).then(d => {
                //if device found generate new api key, update device with apikey and send back in jwt token
                console.error("device found: " + JSON.stringify(d));
                if (d) {
                    //generate new key and send back inside jwt payload with verification of PSK if approved
                    //const newKey = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(20, 40);
                    const crypto = require("crypto");
                    const newKey = crypto.randomBytes(120).toString('hex');
                    const mac = d.name.split("-")[1];
                    console.error("new key: " + newKey);
                    return device.update({
                        id: req.params.id,
                        approved: true,
                        apikey: newKey,
                        mac: mac
                    }, {
                        where: {
                            id: req.params.id,
                            approved: true,
                            apikey: null
                        }, transaction: t})
                        .then(device => {
                            if (device) {
                                return configuration.findOne({where: {id: device.configurationId ? device.configurationId : null}, transaction: t})
                                    .then(c => {
                                    const jwtSigned = jwt.sign({id: req.params.id}, newKey);
                                    res.header['authorization'] = req.headers["authorization"];
                                    return res.json({jwt: jwtSigned, id: req.params.id, configuration: c ? c : null});
                                }).catch(e => {
                                    console.error(e);
                                    return res.sendStatus(500);
                                });
                            } else {
                                return res.sendStatus(500);
                            }
                        }).catch(e => {
                            console.error(e);
                            return res.sendStatus(500);
                        });
                } else {
                    return res.sendStatus(202);
                }
            }).catch(() => res.sendStatus(500));
        }).catch(() => res.sendStatus(500)))

});
/**
 * Handle validation array and respond
 * @param req
 * @param res
 * @returns {boolean}
 */
const handleValidation = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        let error = validationResult(req).array()[0].msg;
        if(typeof error == 'number') res.sendStatus(parseInt(error));
        else res.status(422).json({errors: validationResult(req).array()});
        return false;
    } else {
        return true;
    }
};
module.exports = router;