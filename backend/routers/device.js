const { validationResult } = require("express-validator");
const {database} = require("../db/sequelize");
const {device}  = require("../db/models/device");
const {url} = require("../db/models/url");
const {configuration} = require("../db/models/configuration");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();


// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Device triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/device/:
 *   get:
 *     tags:
 *       - device
 *     description: Get all devices
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.get('/', validators.auth, (req, res) => {
    if(!handleValidation(req, res)) return;

    return device
        .findAll({ attributes: {exclude: ["apikey"]},include: [ {model: configuration, include: [url]}]})
        .then(d => res.json({device: d, jwt: req.header.bearer}))
        .catch((e) => error500(res, e));
});
/**
 * @swagger
 * /api/device/:id:
 *   get:
 *     tags:
 *       - device
 *     description: Get device with given id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Device id, must exist
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       404:
 *          description: device id was not found
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.get('/:id?', [validators.auth, validators.deviceGETOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return device
        .findOne({where: {name: req.params.id}})
        .then(d => d ? res.json({device: d, jwt: req.header.bearer}) : res.sendStatus(404))
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/device/:id:
 *   delete:
 *     tags:
 *       - device
 *     description: Delete device with given id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Device id, must exist
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       404:
 *          description: device id was not found
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.delete('/:id', [validators.auth, validators.deviceDELETEOne], (req, res) => {
    if(!handleValidation(req, res)) return;
    let id = req.params.id;
    return device
        .destroy({where: {id: id}})
        .then(d => d ? res.json({device: d, jwt: req.header.bearer}) : res.sendStatus(404))
        .then(() => cache.delete(id) ? Promise.resolve() : Promise.resolve())
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/device/:
 *   post:
 *     tags:
 *       - device
 *     description: Register device in backend
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         type: string
 *         description: Device name for backend recognition needs to be unique
 *         required: true
 *       - name: description
 *         type: string
 *         description: Device description
 *         required: false
 *       - name: configurationId
 *         type: integer
 *         description: Key which represents associated configuration, nullable
 *         required: false
 *       - name: approved
 *         type: boolean
 *         description: Boolean value if device approved
 *         required: false
 *       - name: registered
 *         type: date RFC3339
 *         description: Date when the device was registered, this value is set upon creation of the device
 *         required: false
 *       - name: approvaltime
 *         type: date RFC3339
 *         description: Date which represents when the device was approved, should not be set manually, even if possible
 *         required: false
 *       - name: apikey
 *         type: string
 *         description: api access key to establish communication to backend, should not be set manually, even if possible
 *         required: false
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.post('/', [validators.auth, validators.devicePOSTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return device
        .create({
            configurationId: req.body.configurationId ? req.body.configurationId : null,
            name: req.body.name,
            approved: req.body.approved,
            approvaltime: req.body.approvaltime,
            apikey: req.body.apikey})
        .then(d => res.json({device: d, jwt: req.header.bearer}))
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/device/:id:
 *   put:
 *     tags:
 *       - device
 *     description: Update device with given id or create a new device
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         type: string
 *         description: Device name for backend recognition needs to be unique
 *         required: true
 *       - name: description
 *         type: string
 *         description: Device description
 *         required: false
 *       - name: configurationId
 *         type: integer
 *         description: Key which represents associated configuration, nullable
 *         required: false
 *       - name: approved
 *         type: boolean
 *         description: Boolean value if device approved
 *         required: false
 *       - name: registered
 *         type: date RFC3339
 *         description: Date when the device was registered, this value is set upon creation of the device
 *         required: false
 *       - name: approvaltime
 *         type: date RFC3339
 *         description: Date which represents when the device was approved, should not be set manually, even if possible
 *         required: false
 *       - name: apikey
 *         type: string
 *         description: api access key to establish communication to backend, should not be set manually, even if possible
 *         required: false
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.put('/:id', [validators.auth, validators.devicePUTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return database.transaction(t =>
        device.findOne({where: {id: req.params.id}, transaction: t})
            .then(d =>
                d ? device.update({
                    name: req.body.name,
                    configurationId: req.body.configurationId ? req.body.configurationId : null,
                    description: req.body.description,
                    approved: req.body.approved,
                    approvaltime: req.body.approvaltime ? req.body.approvaltime : null,
                }, {where: {id: req.params.id}, transaction: t})
                .then(d => d ? Promise.resolve() : Promise.reject(500))
                .catch(e => error500(e))
            : device.create({
                    configurationId: req.body.configurationId ? req.body.configurationId : null,
                    name: req.body.name,
                    approved: req.body.approved,
                    approvaltime: req.body.approvaltime,
                    apikey: req.body.apikey
                }, {transaction: t}).then(d => d ? Promise.resolve() : Promise.reject())
                .catch(e => error500(res, e)))
            .then(() => device.findOne({where: {name: req.body.name}, include: [{model: configuration}], transaction: t})
                .then((dCreated) =>
                    dCreated ? res.json({device: dCreated, jwt: req.header.bearer})
                        : Promise.reject(500))
                .catch(e => error500(res, e)))
            .catch(e => error500(res, e)))
    .catch(e => error500(res, e))
});
const error500 = (res, e) => {
    console.error(e);
    res.sendStatus(500);
};
const handleValidation = (req, res) => {
    if (!validationResult(req).isEmpty()) {
        let error = validationResult(req).array()[0].msg;
        if((typeof error == 'number')) res.sendStatus(parseInt(error));
        else res.status(422).json({errors: validationResult(req).array()});
        return false;
    } else {
        return true;
    }
};
module.exports = router;