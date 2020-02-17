const { validationResult } = require("express-validator");
const {database} = require("../db/sequelize");
const {url} = require("../db/models/url");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();
const jwt = require('jsonwebtoken');


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('url triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/url/:
 *   post:
 *     tags:
 *       - url
 *     description: Get all urls
 *     produces:
 *       - application/json
 *     parameters:
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

    return url.findAll()
        .then(u => u ? res.json({url: u, jwt: req.header.bearer}) : Promise.reject(500))
        .catch((e) => error500(res, e));
});
/**
 * @swagger
 * /api/url/:id:
 *   get:
 *     tags:
 *       - url
 *     description: Get url by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Url id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       404:
 *          description: not found by id
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.get('/:id?', [validators.auth, validators.urlGETOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return url.findOne({where: {id: req.params.id}})
        .then(u => u ? res.json({url: u, jwt: req.header.bearer}) : Promise.reject(500))
        .catch((e) => error500(res, e));
});
/**
 * @swagger
 * /api/url/:id:
 *   delete:
 *     tags:
 *       - url
 *     description: Delete given url by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Url id for backend recognition needs to be unique
 *         required: true
 *     responses:
 *       200:
 *         description: access token returned
 *       401:
 *          description: unauthorized
 *       404:
 *          description: not found by id
 *       422:
 *          description: malformed request
 *       500:
 *         description: server-side error
 */
router.delete('/:id', [validators.auth, validators.urlDELETEOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return url.destroy({where: {id: req.params.id}}).then(u =>
        u ? res.json({url: u, jwt: req.header.bearer})
        :   res.sendStatus(500))
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/url/:
 *   post:
 *     tags:
 *       - url
 *     description: Create given url
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Url id for backend recognition needs to be unique
 *         required: true
 *       - name: url
 *         type: string
 *         description: url
 *         required: true
 *       - name: description
 *         type: string
 *         description: Url description
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
router.post('/', [validators.auth, validators.urlPOSTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return url.findOne({where: {id: req.params.id}})
            .then((u) =>
            u ? url.update({
                    url: req.body.url,
                    description: req.body.description}, {where: {id: req.params.id}})
                    .then(u => u ? res.json({url: u, jwt: req.header.bearer}) : Promise.reject(500))
                    .catch(e => error500(res, e))
            :   url.create({url: req.body.url, description: req.body.description})
                    .then(u => res.json({url: u, jwt: req.header.bearer}))
                    .catch(e => error500(res, e)))
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/url/:id:
 *   put:
 *     tags:
 *       - url
 *     description: Create given url with id or create a new url if it does not exist
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: Url id for backend recognition needs to be unique
 *         required: true
 *       - name: url
 *         type: string
 *         description: url
 *         required: true
 *       - name: description
 *         type: string
 *         description: Url description
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
router.put('/:id', [validators.auth, validators.urlPUTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    url.findOne({where: {id: req.params.id}})
    .then((u) => {
        if (u) {
            url.update({
                url: req.body.url,
                description: req.body.description,
            }, {where: {id: req.params.id}})
                .then(u => u ? res.json({url: u, jwt: req.header.bearer}) : Promise.reject(500))
                .catch(e => error500(res, e));
        } else {
            url.create({url: req.body.url, description: req.body.description})
            .then(u => res.json({url: u, jwt: req.header.bearer}))
            .catch(e => error500(res, e));
        }
    });
});
/**
 * Log fatal error and send 500
 * @param res
 * @param e
 */
const error500 = (res, e) => {
    console.error(e);
    res.sendStatus(500);
};
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
module.exports = router;
