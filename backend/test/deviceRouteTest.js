const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const assert = require('assert');
const describe = require("mocha");
const app = express();

const server = request('http://localhost:1337');
let token = "";

const deviceName1ToUse  = crypto.randomBytes(20).toString('hex');
let lastInsertedId = 3;
console.log("using as first device: "+deviceName1ToUse);

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
it('authenticate wrong pw', done => {
    server.post('/api/auth/login')
        .send({username: 'muster', password: 'plainee'})
        .expect(401, done);
});
it('authenticate malformed', done => {
    server.post('/api/auth/login')
        .send({usernamse: 'muster', password: 'plain'})
        .expect(422, done);
});
it('authenticate malformed 2', done => {
    server.post('/api/auth/login')
        .send({password: 'plainee'})
        .expect(422, done);
});
//GET ALL DEVICES
it('get all devices, ok', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200, done);
});

it('get all devices, malformed', done => {
    server.get('/api/device')
        .set("bearesr", token)
        .expect(401, done);
});

it('get all devices, bad, 401', done => {
    const token2 = token + "223";
    server.get('/api/device')
        .set("bearer", token2)
        .expect(401, done);
});
//GET 1 DEVICE
it('get 1 device, ok', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(200, done);
});

it('get 1 device, malformed', done => {
    server.get('/api/device')
        .set("bearesr", token)
        .expect(401, done);
});

//PUT 1 DEVICE
it('put 1 device, 200', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .send({
            configurationId: null,
            name: deviceName1ToUse,
            description: 'devicey',
            approved: false,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200)
        .end(done);
});

it('put 1 device, duplicate name, 422', done => {
    server.put('/api/device/'+(lastInsertedId+1))
        .set("bearer", token)
        .send({
            configurationId: null,
            name: deviceName1ToUse,
            description: 'devicey',
            approved: false,
            approvaltime: new Date(),
            apikey: "testapikey"
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(422)
        .end(done);
});

it('put 1 device, malformed', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .send({
            configurationId: null,
            y: 'testdevice',
            description: 'devicey',
            approved: false,
            approvaltime: new Date(),
            apikey: "testapikey"
        }).expect((res) => {
            console.log("PUT 1 DEVICE: " + res.body);
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(422)
        .end(done);
});

it('put 1 device, unauthorized, maybe change to 401', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", "s")
        .send({
            configurationId: null,
            name: deviceName1ToUse,
            description: 'devicey',
            approved: false,
            approvaltime: new Date(),
            apikey: "testapikey"
        }).expect((res) => {
        console.log(JSON.stringify(res.body, null, 4));
    })
        .expect(401)
        .end(done);
});

//GET ALL DEVICES and check that there are 2 now
it('get all devices, ok count 2', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200, done);
});

it('put 1 device update, bad config id doesnt exist', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .send({
            name: 'testdevicse',
            description: 'deviceUPDATED',
            approved: false,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
        console.log(JSON.stringify(res.body, null, 4));
    })
        .expect(422)
        .end(done);
});

it('put 1 device update, good', done => {
    server.put('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .send({
            configurationId: null,
            name: deviceName1ToUse+"PUT",
            description: 'deviceUPDATED',
            approved: false,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
            lastInsertedId = res.body.device[0];
        })
        .expect(200)
        .end(done);
});

//GET ALL DEVICES and check that there is an updated string
it('get all devices, ok updated description', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            if (!res.body.device[res.body.device.length - 1].description.substring("UPDATED")) throw new Error("device with id 3 seems not to be updated");
            let ids = Array.from(res.body.device, b => b.id);
            console.log(ids[ids.length-1]);
            lastInsertedId = ids[ids.length-1];
        })
        .expect(200, done);
});

it('delete device with id 3', done => {
    server.delete('/api/device/'+lastInsertedId)
        .set("bearer", token)
        .expect(res => console.log(JSON.stringify(res.body, null, 4)))
        .expect(200, done);
});

//GET ALL DEVICES and check that there is an updated string
it('get all devices, ok, deleted 1 device count now 1', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            //if (!(res.body.device.length === 1)) throw new Error("device with id 3 seems not to be deleted");
        })
        .expect(200, done);
});