const {registration} = require("./models/registration");
const {header} = require("express-validator");
const Sequelize = require('sequelize');
const {body,check, param} = require("express-validator");
const {device} = require("./models/device");
const {configuration} = require("./models/configuration");
const {user} = require("./models/user");
const jwt = require('jsonwebtoken');
const Op = Sequelize.Op;
const express = require('express');

module.exports = {
    login: [
        body('username').exists()
            .isLength({ min:5, max:100 }).withMessage('username needs to be under 100 characters.'),
        body('password').exists().isString().withMessage('password malformed'),
    ],
    auth: [
        header('bearer').custom(bearer => {
            if (!bearer){
                return Promise.reject(401);
            }
            const result = jwt.decode(bearer);
            if (result) {
                return user.findOne({where: { username: result.username ? result.username : null}})
                    .then(u => {
                        if (u) {
                            console.log("found user " + u.username);
                            try {
                                const decoded = jwt.verify(bearer, u.password);
                            } catch(err) {
                                //console.error(err);
                                return Promise.reject(401);
                            }
                        } else {
                            return Promise.reject(401);
                        }
                    })
                    .catch(e => {
                        console.error(e);
                        return Promise.reject(401);
                    });
            } else {
                return Promise.reject(401);
            }
        }).withMessage("Invalid token"),
    ],
    deviceGETOne: [
        param('id').isInt().withMessage('given id needs to be an integer'),
    ],
    deviceDELETEOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return device.findOne({where: {id: id}})
                .then(device => {
                    if (!device)
                        return Promise.reject('device doesnt exist');
                });
        }),
    ],
    devicePUTOne: [
        param('id').isInt().withMessage('given id needs to be an integer'),
        body('configurationId')
            .exists({ checkNull: false }).withMessage('given configurationId needs to be an integer')
            .if(id => id !== null).isInt().withMessage('given configurationId need to be an integer')
            .custom((cfgId,{ req }) => {
            return configuration.findOne({where: {
                    id: cfgId
                }})
                .then(c => (c) ? Promise.resolve() : Promise.reject('configuration doesnt exist'));
            }),
        body('approved')
            .isBoolean().withMessage('given approved needs to be a boolean value'),
        body('name')
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:1 }).withMessage('Device name is a required field.')
            .isLength({ max:50 }).withMessage('Device name needs to be under 50 characters.'),
        body('name').custom((name,{ req }) => {
            return device.findOne({where: {
                [Op.and]: [
                    {id: { [Op.ne] : req.params.id }},
                    {name: name}]
                }})
                .then(device =>
                    (device && (device.id !== param('id'))) ?
                        Promise.reject('device name already exists') : Promise.resolve()
                );
        }),
        body('description')
            .if(input => input !== null)
            .isLength({ min:1 }).withMessage('Device description is a required field.')
            .isLength({ max:255 }).withMessage('Device description needs to be under 255 characters.'),
        body('approvaltime')
            .if(input => input !== null)
            .isRFC3339().withMessage('given date needs to follow RFC3339 Standard'),
        /*body('apikey')
            .if(input => input === undefined || input !== null)
            .isLength({ min:1 }).withMessage('apikey is a required field.')
            .isLength({ max:255 }).withMessage('apikey needs to be under 255 characters.'),*/
        //body('approved').optional().isBoolean().withMessage('Approved is a required field and needs to be a boolean')
    ],
    devicePOSTOne: [
        body('configurationId')
            .exists({ checkNull: false }).withMessage('given configurationId needs to be an integer')
            .if(id => id !== null).isInt().withMessage('given configurationId need to be an integer')
            .custom((cfgId,{ req }) => {
                return configuration.findOne({where: {
                        id: cfgId
                    }})
                    .then(c => (c) ? Promise.resolve() : Promise.reject('configuration doesnt exist'));
            }),
        body('approved')
            .isBoolean().withMessage('given approved needs to be a boolean value'),
        body('name')
            .isLength({ min:1 }).withMessage('Device name is a required field.')
            .isLength({ max:50 }).withMessage('Device name needs to be under 50 characters.'),
        body('name').custom((name,{ req }) => {
            return device.findOne({where: {name: name}})
                .then(device =>
                    (device /*&& (device.id !== param('id'))*/) ?
                        Promise.reject('device name already exists') : Promise.resolve()
                );
        }),
        body('description')
            .if(input => input !== null)
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:1 }).withMessage('Device description is a required field.')
            .isLength({ max:255 }).withMessage('Device description needs to be under 255 characters.'),
        body('approvaltime')
            .if(input => input !== null)
            .isRFC3339().withMessage('given date needs to follow RFC3339 Standard'),
        body('apikey')
            .if(input => input !== null)
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:1 }).withMessage('apikey is a required field.')
            .isLength({ max:255 }).withMessage('apikey needs to be under 255 characters.'),
    ],
    deviceAwaitAppprove: [
        param('id').isInt().withMessage('given id needs to be an integer'),
        param('id').custom(id => {
            return device.findOne({where: {id: id, approved:true, apikey: {[Op.ne]: null}}})
                .then(device => {
                    if (device) {
                        return Promise.reject('device does not exist, is already approved or apikey was set manually');
                    }
                });
        }),
    ],
    extGETStatus: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return device.findOne({where: {id: id}})
                .then(device => {
                    if (!device) {
                        return Promise.reject(404);
                    }
                });
        }),
    ],
    extGETConfiguration: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return device.findOne({where: {id: id}})
                .then(device => {
                    if (!device) {
                        return Promise.reject(404);
                    }
                });
        }),
        header('bearer').custom((bearer,{ req }) => {
            return !bearer ?
                Promise.reject('unauthorized')
                : device.findOne({where:{id: req.params.id}}).then(d => {
                    //console.log("fetched PSK: " + d.registerkey);
                    if (d && d.apikey) {
                        let result = jwt.verify(bearer, d.apikey);
                        if(!result){
                            console.error("unauthorized");
                            return Promise.reject(401);
                        } else {
                            console.log("resolved");
                            return Promise.resolve();
                        }
                    } else {
                        console.error("no registration found");
                        return Promise.reject(500);
                    }

                }).catch(e => {
                    console.error(e);
                    return Promise.reject(e);
                });
        }),
        /*
        body('urls')
            .if(input => input !== null)
            .isArray().withMessage('urls need to be an array.'),
        body('cycletime')
            .if(input => input !== null)
            .isInt({ min:1 }).withMessage('cycletime needs to be an integer'),
        body('reloadtime')
            .if(input => input !== null)
            .isInt({ min:1 }).withMessage('reloadtime needs to be an integer'),*/

    ],
    extPOSTStatus: [
        body('id').isInt().withMessage('given id need to be an integer'),
        body('id').custom(id => {
            return device.findOne({where: {id: id}})
                .then(device => {
                    if (!device) {
                        return Promise.reject(404);
                    }
                });
        }),
        header('bearer').custom((bearer,{ req }) => {
            return !bearer ?
                Promise.reject('unauthorized')
            : device.findOne({where:{id:req.body.id}}).then(d => {
                if (d && d.apikey) {
                    let result = jwt.verify(bearer, d.apikey);
                    if(!result){
                        console.error("unauthorized");
                        return Promise.reject(401);
                    } else {
                        console.log("resolved");
                        return Promise.resolve();
                    }
                } else {
                    console.error("no registration found");
                    return Promise.reject(500);
                }
            }).catch(e => {
                console.error(e);
                return Promise.reject(e);
            });
        }),
        /*
        body('urls')
            .if(input => input !== null)
            .isArray().withMessage('urls need to be an array.'),
        body('cycletime')
            .if(input => input !== null)
            .isInt({ min:1 }).withMessage('cycletime needs to be an integer'),
        body('reloadtime')
            .if(input => input !== null)
            .isInt({ min:1 }).withMessage('reloadtime needs to be an integer'),*/

    ],
    deviceApprove: [
        body('id').isInt().withMessage('given id need to be an integer'),
        body('id').custom(id => {
            return device.findOne({where: {id: id, approve: false}})
                .then(device => {
                    if (!device) {
                        return Promise.reject('device does not exist or is already approved');
                    }
                });
        }),
    ],
    deviceRegister: [
        check('name')
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:1 }).withMessage('Device name is a required field.')
            .isLength({ max:255 }).withMessage('Device name needs to be under 255 characters.'),
        body('name').custom(value => {
            return device.findOne({where: { name: value }})
                .then(device => {
                if (device) {
                    return Promise.reject('device name already in use or device already registered');
                }
            }).catch(e => {
                console.error(e);
                return Promise.reject('device name already in use or device already registered');
            });
        }),
    ],
    validateURL: [
        check('url')
            .isURL().withMessage('URL is invalid format')
    ],
    validateUsercfg: [
        check('cycletime')
            .isInt({min: 2, max: 600}).withMessage('Cycletime out of bounds or not a whole number'),
        check('reloadtime')
            .isInt({min: 2, max: 600}).withMessage('Reloadtime out of bounds or not a whole number'),
    ],
    configurationPUTOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        body('name')
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:1 }).withMessage('configuration name is a required field.')
            .isLength({ max:50 }).withMessage('configuration name needs to be under 50 characters.'),
        body('name').custom((name,{ req }) => {
            return configuration.findOne({where: {
                    [Op.and]: [
                        {id: { [Op.ne] : req.params.id }},
                        {name: name}]
                }})
                .then(device =>
                    (device && (device.id !== param('id'))) ?
                        Promise.reject('cfg name already exists') : Promise.resolve()
                );
        }),
        body('description')
            .if(input => input !== null)
            .isString().withMessage("given value needs to be a string")
            .isLength({ min:0 }).withMessage('configuration description is a minimum of 1 character.')
            .isLength({ max:255 }).withMessage('configuration description needs to be under 255 characters.'),
        body('cycletime')
            .isInt().withMessage('given cycletime needs to be an integer'),
        body('reloadtime')
            .isInt().withMessage('given reloadtime needs to be an integer'),
        body('urls')
            .isArray().withMessage('given urls needs to be an array'),
        body('urls').custom((urls,{ req }) => {
            for (const url of urls) {
                if(!(url instanceof String)){
                    return new Error("Given urls are not all strings");
                }
                if(url.length > 2000){
                    return new Error("One Url is too long, 2000 or less characters are allowed");
                }
            }
        }),

    ],
    configurationPOSTOne: [
        body('name')
            .isString().withMessage("given name needs to be a string")
            .isLength({ min:1 }).withMessage('configuration name is a required field.')
            .isLength({ max:50 }).withMessage('configuration name needs to be under 50 characters.'),
        body('name').custom((name,{ req }) =>
            configuration.findOne({where: {name: name}})
            .then(device =>
                (device && (device.id !== param('id'))) ?
                    Promise.reject('cfg name already exists') : Promise.resolve()
            )),
        body('description')
            .if(input => input !== null)
            .isString().withMessage("given name needs to be a string")
            .isLength({ min:1 }).withMessage('configuration description is a minimum of 1 character.')
            .isLength({ max:255 }).withMessage('configuration description needs to be under 255 characters.'),
        body('cycletime')
            .isInt({lt: 2147483647}).withMessage('given cycletime needs to be an integer and below 2**32'),
        body('reloadtime')
            .isInt({lt: 2147483647}).withMessage('given reloadtime needs to be an integer and below 2**32'),
        body('urls')
            .isArray().withMessage('given urls needs to be an array'),
        body('urls').custom((urls,{ req }) => {
            for (const url of urls) {
                if(!(url instanceof String)){
                    return new Error("Given urls are not all strings");
                }
                if(url.length > 2000){
                    return new Error("One Url is too long, 2000 or less characters are allowed");
                }
            }
            return Promise.resolve();
        }),

    ],
    configurationGETOne: [
        param('id').isInt().withMessage('given id needs to be an integer'),
    ],
    configurationDELETEOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return configuration.findOne({where: {id: id}})
                .then(configuration => {
                    if (!configuration)
                        return Promise.reject('configuration doesnt exist');
                });
        }),
    ],
    urlGETOne: [
        param('id').isInt().withMessage('given id needs to be an integer'),
    ],
    urlDELETEOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return url.findOne({where: {id: id}})
                .then(url => {
                    if (!url)
                        return Promise.reject('url doesnt exist');
                });
        }),
    ],
    urlPUTOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        body('url')
            .isString().withMessage('url needs to be string')
            .isLength({ min:1 }).withMessage('url is a required field.')
            .isLength({ max:255 }).withMessage('url needs to be under 50 characters.'),
        body('description')
            .if(url => url !== null).isLength({ min:1 }).withMessage('url description is a required field.')
            .if(url => url !== null).isLength({ max:255 }).withMessage('url description needs to be under 255 characters.'),
    ],
    urlPOSTOne: [
        body('url')
            .isLength({ min:1 }).withMessage('url is a required field.')
            .isLength({ max:255 }).withMessage('url needs to be under 50 characters.'),
        body('description')
            .if(url => url !== null).isLength({ min:1 }).withMessage('url description is a required field.')
            .if(url => url !== null).isLength({ max:255 }).withMessage('url description needs to be under 255 characters.'),
    ],
    userGETOne: [
        param('id').isInt().withMessage('given id needs to be an integer'),
    ],
    userDELETEOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        param('id').custom(id => {
            return user.findOne({where: {id: id}})
                .then(user => {
                    if (!user)
                        return Promise.reject('user doesnt exist');
                });
        }),
    ],
    userPUTOne: [
        param('id').isInt().withMessage('given id need to be an integer'),
        body('username')
            .isString().withMessage('username needs to be a string')
            .isLength({ min:1 }).withMessage('username is a required field.')
            .isLength({ max:255 }).withMessage('username needs to be under 50 characters.'),
        body('password')
            .isString().withMessage('password needs to be a string')
            .isLength({ min:1 }).withMessage('user password is a required field.')
            .if(password => username !== null).isLength({ max:255 }).withMessage('username description needs to be under 255 characters.'),
    ],
    userPOSTOne: [
        body('username')
            .isString().withMessage('username needs to be a string')
            .isLength({ min:1 }).withMessage('username is a required field.')
            .isLength({ max:255 }).withMessage('username needs to be under 50 characters.'),
        body('password')
            .isString().withMessage('password needs to be a string')
            .isLength({ min:1 }).withMessage('user password is a required field.')
            .if(password => username !== null).isLength({ max:255 }).withMessage('username description needs to be under 255 characters.'),
    ],
};