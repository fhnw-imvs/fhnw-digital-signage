const request = require('supertest');
const express = require('express');
const assert = require('assert');
const app = express();
const server = request('http://localhost:1337');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const {registration} = require("./../db/models/registration");

let token = "";
const deviceName1ToUse  = crypto.randomBytes(20).toString('hex');
console.log("using as first device: "+deviceName1ToUse);
let lastinsertedId;
let apiKey ="";
let regkey = require('./../tools/global').REGISTERKEY;

it('get PSK', done => {
    registration.findOne().then(r => {
        console.log("fetched PSK: " + r.registerkey);
        regkey = r.registerkey
        console.log("set PSK: " + regkey);
    }).catch(error => console.error(error));
    done();
});

it('authenticate correct', done => {
    server.post('/api/auth/login')
        .send({username: 'muster', password: 'plain'})
        .expect(200)
        .expect((res) => {
            if (!('jwt' in res.body)) throw new Error("missing jwt token");
            if (res.body.jwt === "") throw new Error("jwt token cannot be null");
            token = res.body.jwt;
        })
        .end(done);
});
const getBuffer = (data) => {
    console.log("BUFFER" + require('./../tools/global').REGISTERKEY);
    return crypto
        .createHmac("sha256", require('./../tools/global').REGISTERKEY)
        .update(Buffer.from(data.toString(), 'hex'))
        .digest("hex");
};
const getBufferBad = (data) => {
    return crypto
        .createHmac("sha256", "asd")
        .update(Buffer.from(data.toString(), 'hex'))
        .digest("hex");
};
it('register bad', done => {
    const data = {
        configurationId: null,
        name: 'testdevqweicqwe213ees',
        description: 'devicey',
        approved: false,
        approvaltime: new Date(),
        apikey: "testapikey"
    };
    console.log(getBuffer(data));
    server.post('/api/ext/register')
        .set('authorization', getBufferBad(data))
        .send(data)
        .expect(res => console.log(JSON.stringify(res.body)))
        .expect(401)
        .end(done);
});

it('register good', done => {
    const data = {
        configurationId: null,
        name: deviceName1ToUse,
        description: 'devicey',
        approved: false,
        approvaltime: new Date(),
        apikey: "testapikey"
    };
    console.log(getBuffer(data));
    server.post('/api/ext/register')
        .set('authorization', getBuffer(data))
        .send(data)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            lastInsertedId = res.body.device.id;

        })
        .expect(200)
        .end(done);
});
it('get all devices, ok, check 1 device with 1 id 1 not approved', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            //if (!(res.body.device.length === 1)) throw new Error("device with id 3 seems not to be deleted");
        })
        .expect(200, done);
});
it('await good, not approved', done => {
    console.log(getBuffer({}));
    server.get('/api/ext/awaitapprove/'+lastInsertedId)
        .set('authorization', getBuffer({}))
        .expect(res => console.log(JSON.stringify(res.body)))
        .expect(202)
        .end(done);
});

it('put 1 device update approved, good', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .send({
            configurationId: null,
            name:  deviceName1ToUse,
            description: 'deviceAPPROVED',
            approved: true,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
            console.log("PUT 1 DEVICE UPDATE: " + res.body);
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200)
        .end(done);
});

console.log("FETCHED PSK FOR APPROVAL TEST:" + require('./../tools/global').REGISTERKEY);
let jwtTokenE = "";
it('await good, approved', done => {
    console.log(getBuffer({}));
    server.get('/api/ext/awaitapprove/'+lastInsertedId)
        .set('authorization', getBuffer({}))
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            console.log("using regkey: "+regkey);
            let jwtToken = jwt.verify(res.body.jwt, regkey);
            apiKey = jwtToken.apikey;
            jwtTokenE = res.body.jwt;
            console.log("got apikey: "+apiKey);
        })
        .expect(200)
        .end(done);
});

it('await good, already approved 422', done => {
    console.log(getBuffer({}));
    server.get('/api/ext/awaitapprove/' + lastInsertedId)
        .set('authorization', getBuffer({}))
        .expect(res => console.log(JSON.stringify(res.body, null, 4)))
        .expect(422)
        .end(done);
});

for (let i = 0; i < 1; i++) {
    it('send status', done => {
        server.post('/api/ext/status/')
            .send({id: lastInsertedId, bearer: jwtTokenE})
            .expect(res => console.log(JSON.stringify(res.body, null, 4)))
            .expect(200)
            .end(done);
    });

    it('get status', done => {
        server.get('/api/ext/status/'+lastInsertedId)
            .set('bearer',token)
            .expect(res => console.log(JSON.stringify(res.body, null, 4)))
            .expect(200)
            .end(done);
    });
}

it('get status', done => {
    console.log("apikey: " + apiKey);
    server.get('/api/ext/status/'+lastInsertedId)
        .set('bearer',token)
        .expect(res => console.log(JSON.stringify(res.body, null, 4)))
        .expect(200)
        .end(done);
});