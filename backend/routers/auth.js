const { validationResult } = require("express-validator");
const {user}  = require("../db/models/user");
const express = require('express');
const validators = require("../db/validators");
const router = express.Router();
const jwt = require('jsonwebtoken');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Device triggered time: ', Date.now());
    next();
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     description: Login with admin credentials
 *     parameters:
 *       - name: username
 *         type: string
 *         description: username to login
 *         required: true
 *       - name: password
 *         type: string
 *         description: password to login
 *         required: true
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
router.post('/login', validators.login, (req, res) => {
    if(!handleValidation(req, res)) return;

    return user.findOne({where: {username: req.body.username}}).then(u => {
        if (u && u.password === req.body.password){
            const jwtSigned = jwt.sign({username: u.username}, u.password);
            return res.json({jwt: jwtSigned});
        } else {
            return res.sendStatus(401);
        }
    }).catch((e) => {
        console.error(e);
        res.sendStatus(500);
    });
});

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