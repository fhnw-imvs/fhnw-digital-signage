const { validationResult } = require("express-validator");
const {database} = require("../db/sequelize");
const {url}  = require("../db/models/url");
const {configuration} = require("../db/models/configuration");
const {urlcfgjunction} = require("../db/models/urlcfgjunction");
const {device} = require("../db/models/device");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Configuration triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/configuration/:
 *   get:
 *     tags:
 *       - configuration
 *     description: Get all configurations
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: access token returned with all configurations
 *       401:
 *          description: unauthorized
 *       404:
 *          description: no configurations found
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.get('/', validators.auth, (req, res) => {
    if(!handleValidation(req, res)) return;

    return configuration.findAll({ include: [ {model: device}, {model: url}]}).then(c => {
        res.json({configuration: c, jwt: req.header.bearer});
    }).catch((e) => {
        console.error(e);
        res.sendStatus(500);
    });
});
/**
 * @swagger
 * /api/configuration/:id:
 *   get:
 *     tags:
 *       - configuration
 *     description: Get given configuration
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Configuration id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned and configuration
 *       401:
 *          description: unauthorized
 *       404:
 *          description: id not found
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.get('/:id?', [validators.auth, validators.configurationGETOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return configuration.findOne({where: {id: req.params.id}}).then(c => {
        if(c) {
            res.json({configuration: c, jwt: req.header.bearer});
        }
        res.sendStatus(404);
    }).catch((e) => {
        console.error(e);
        res.sendStatus(500);
    });
});
/**
 * @swagger
 * /api/configuration/:id:
 *   delete:
 *     tags:
 *       - configuration
 *     description: Delete given configuration
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Configuration id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       404:
 *          description: id not found
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.delete('/:id', [validators.auth, validators.configurationDELETEOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return configuration.destroy({where: {id: req.params.id}}).then(c =>
            c ? res.json({configuration: {id: req.params.id}, jwt: req.header.bearer})
            : res.sendStatus(404)
        ).catch((e) => {
            console.error(e);
            return res.sendStatus(500);
        });
});
/**
 * @swagger
 * /api/configuration/:
 *   post:
 *     tags:
 *       - configuration
 *     description: Create configuration
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         type: string
 *         description: Configuration name for backend recognition needs to be unique
 *         required: true
 *       - name: description
 *         type: string
 *         description: Description of configuration
 *         required: false
 *       - name: cycletime
 *         type: integer
 *         description: Time in seconds to cycle through the set of urls
 *         required: true
 *       - name: reloadtime
 *         type: integer
 *         description: Time in seconds to reload the current url
 *         required: true
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
router.post('/', [validators.auth, validators.configurationPOSTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return database.transaction(t =>
        configuration.create({
            name: req.body.name,
            description: req.body.description,
            reloadtime: req.body.reloadtime,
            cycletime: req.body.cycletime,
            transaction: t})
        .then(c =>
            c ? req.body.urls.length > 0 ?
                    Promise.map(req.body.urls, iterUrl =>
                        url.findOne({where: {url: iterUrl}, transaction: t})
                            .then(u =>
                                u ? updateJunction(c, u, t)
                                : url.create({url: iterUrl, transaction: t})
                                    .then(u => u ? updateJunction(c, u, t) : Promise.reject(500))
                                    .catch(e => reject500(e)))
                            .catch(e => reject500(e)))
                : c
            : Promise.reject(500)))
        .then(() => configuration.findOne({where: {name: req.body.name}, include: [{model: device}, {model: url}]})
                .then((cCreated) =>
                    cCreated ? res.json({configuration: cCreated, jwt: req.header.bearer})
                        : Promise.reject(500))
                .catch(e => reject500(e)))
        .catch(e => reject500(e))
});
/**
 * @swagger
 * /api/configuration/:id:
 *   put:
 *     tags:
 *       - configuration
 *     description: Update or create if not exists configuration
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         type: string
 *         description: Configuration name for backend recognition needs to be unique
 *         required: true
 *       - name: description
 *         type: string
 *         description: Description of configuration
 *         required: false
 *       - name: cycletime
 *         type: integer
 *         description: Time in seconds to cycle through the set of urls
 *         required: true
 *       - name: reloadtime
 *         type: integer
 *         description: Time in seconds to reload the current url
 *         required: true
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
router.put('/:id', [validators.auth, validators.configurationPUTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return database.transaction(t =>
        configuration.findOne({where: {id: req.params.id}, transaction: t})
        .then((cFound) =>
            cFound ? configuration.update({
                    name: req.body.name,
                    description: req.body.description,
                    reloadtime: req.body.reloadtime,
                    cycletime: req.body.cycletime,
                }, {where: {id: req.params.id}, transaction: t})
                .then(c =>
                    c ? Promise.map(req.body.urls, iterUrl =>
                        url.findOne({where: {url: iterUrl}, transaction: t})
                            .then(u =>
                                u ? updateJunction(cFound, u, t)
                                : url.create({url: iterUrl, transaction: t})
                                    .then(u => u ? updateJunction(cFound, u, t) : Promise.reject(500))
                                    .catch((e) => reject500(e)))
                            .catch((e) => reject500(e)))
                    : Promise.reject(500))
                .then(c => url.findAll({where: {url: {[Op.in]: req.body.urls}}, attributes: ['id'], raw: true, transaction: t})
                    .then(urlIds => urlcfgjunction.findAll({
                        where: {
                            configurationId: cFound.id,
                            urlId: {[Op.notIn]: Array.from(urlIds, id => id['id'])}
                        }, attributes: ['urlId'], raw: true, transaction: t})
                        .then(urls =>
                            urls ? Promise.map(Array.from(urls,id => id['urlId']) , iterUrlID =>
                                urlcfgjunction.destroy({where:{urlId: iterUrlID, configurationId: cFound.id}, transaction: t})
                                    .then(j => j ? Promise.resolve() : console.error(500))
                                    .catch(e => reject500(e)))
                            : Promise.reject(500))
                        .catch(e => reject500(e)))
                    .catch(e => reject500(e)))
                .catch(e => reject500(e))
            : configuration.create({
                    name: req.body.name,
                    description: req.body.description,
                    reloadtime: req.body.reloadtime,
                    cycletime: req.body.cycletime,
                    transaction: t})
                .then(c =>
                    c ? Promise.map(req.body.urls, iterUrl =>
                        url.findOne({where: {url: iterUrl}, transaction: t})
                            .then(u =>
                            u ? updateJunction(c, u, t)
                            : url.create({url: iterUrl, transaction: t})
                                .then(u => u ? updateJunction(c, u, t) : Promise.reject(500))
                                .catch(e => reject500(e)))
                            .catch(e => reject500(e)))
                    : Promise.reject(500))
                .catch(e => reject500(e))))
        .then(result => configuration.findOne({where: {name: req.body.name}, include:[{model: device}, {model: url}]})
            .then((cUpdated) =>
                cUpdated ? res.json({configuration: cUpdated, jwt: req.header.bearer})
                : Promise.reject("ERROR:"+ cUpdated))
            .catch(e => reject500(e)))
        .catch(e => reject500(e))
});
/**
 * handles validation with given result from validator middleware, see db/validators.js
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
/**
 * Log fatal error and resolve Promise
 * @param e
 * @param e
 */
const reject500 = e => {
    console.error(e);
    return Promise.reject(500);
};
/**
 * Updates junction with given parameters for many to many relationship datatable configuration <-> url
 * @param t
 * @param c
 * @param u
 * @param t
 */
const updateJunction = (c, u, t) =>
    urlcfgjunction
        .findOne({where: {
            configurationId: c.id,
            urlId: u.id
        }, transaction: t})
        .then(j =>
            j ? Promise.resolve()
            : urlcfgjunction.create({configurationId: c.id, urlId: u.id, transaction: t})
                .then(j => j ? Promise.resolve() : Promise.reject(500))
                .catch((e) => reject500(e)))
        .catch((e) => reject500(e));

module.exports = router;