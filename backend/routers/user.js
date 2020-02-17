const { validationResult } = require("express-validator");
const {database} = require("../db/sequelize");
const {user} = require("../db/models/user");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();
const jwt = require('jsonwebtoken');


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('user triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/user/:
 *   post:
 *     tags:
 *       - user
 *     description: Get all users
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

    return user.findAll()
        .then(u => {
            if (u) {
                u.map(user => {
                    user.password = null;
                    user.salt = null;
                });
                res.json(u);
            }
            else  Promise.reject(500);
        })
        .catch((e) => error500(res, e));
});
/**
 * @swagger
 * /api/user/:id:
 *   get:
 *     tags:
 *       - user
 *     description: Get user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: user id for backend recognition needs to be unique
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
router.get('/:id?', [validators.auth, validators.userGETOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return user.findOne({where: {id: req.params.id}})
        .then(u => u ? res.json({user: { id: user.id, username: u.username, password: null }, jwt: req.header.bearer}) : Promise.reject(500))
        .catch((e) => error500(res, e));
});
/**
 * @swagger
 * /api/user/:id:
 *   delete:
 *     tags:
 *       - user
 *     description: Delete given user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: user id for backend recognition needs to be unique
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
router.delete('/:id', [validators.auth, validators.userDELETEOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return user.destroy({where: {id: req.params.id}}).then(u =>
        u ? res.json({user: { id: user.id, username: u.username, password: null }, jwt: req.header.bearer})
        :   res.sendStatus(500))
        .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/user/:
 *   post:
 *     tags:
 *       - user
 *     description: Create given user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: user id for backend recognition needs to be unique
 *         required: true
 *       - name: username
 *         type: string
 *         description: username
 *         required: true
 *       - name: password
 *         type: string
 *         description: user password
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
router.post('/', [validators.auth, validators.userPOSTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return user.create({username: req.body.username, password: req.body.password})
                    .then(u => res.json({user: { id: u.id, username: u.username, password: null }, jwt: req.header.bearer}))
                    .catch(e => error500(res, e));
});
/**
 * @swagger
 * /api/user/:id:
 *   put:
 *     tags:
 *       - user
 *     description: Create given user with id or create a new user if it does not exist
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         type: integer
 *         description: user id for backend recognition needs to be unique
 *         required: true
 *       - name: username
 *         type: string
 *         description: username
 *         required: true
 *       - name: password
 *         type: string
 *         description: user password
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
router.put('/:id', [validators.auth, validators.userPUTOne], (req, res) => {
    if(!handleValidation(req, res)) return;

    return user.findOne({where: {id: req.params.id}})
    .then(u => {
        if (u) {
            user.update({
                username: req.body.username,
                password: req.body.password,
            }, {where: {id: req.params.id}})
                .then(u => u ? res.json({user: { id: user.id, username: u.username, password: null }, jwt: req.header.bearer}) : Promise.reject(500))
                .catch(e => error500(res, e));
        } else {
            user.create({username: req.body.username, password: req.body.password})
            .then(u => res.json({user: { id: user.id, username: u.username, password: null }, jwt: req.header.bearer}))
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
