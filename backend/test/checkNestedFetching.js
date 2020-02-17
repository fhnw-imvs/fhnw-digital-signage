const request = require('supertest');
const express = require('express');
const assert = require('assert');
const app = express();
const crypto = require('crypto');

// noinspection JSCheckFunctionSignatures
const server = request('http://localhost:1337');
let token = "";

const deviceName1ToUse  = crypto.randomBytes(20).toString('hex');
console.log("using as first device: "+deviceName1ToUse);
const cfgName1ToUse  = crypto.randomBytes(20).toString('hex');
console.log("using as first device: "+cfgName1ToUse);


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

it('get status of device, ok', done => {
    server.get('/api/ext/status/15')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});
it('get all cfg, ok', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});
it('get all user, ok', done => {
    server.get('/api/user')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});
it('create user, ok', done => {
    server.post('/api/user/')
        .set("bearer", token)
        .send({
            username: "tester",
            password: "testpw",
        }).expect(res => {
            console.log(res.body);
        })
        .expect(200)
        .end(done);
});


//for (let i = 0; i < 1000; i++){
/*
it('put 1 configuration, ok', done => {
    server.put('/api/configuration/12')
        .set("bearer", token)
        .send({
            name: '11-device-CC:40:D0:46:C3:82-xtitgs',
            description: "testy",
            reloadtime: 33,
            cycletime: 5,
            urls: ["https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org","https://google.com", "https://wnbck.myftp.org"]
        }).expect((res) => {
        console.log(JSON.stringify(res.body, null, 4));
    })
        .expect(200)
        .end(done);
});
it('put 1 device, ok', done => {
    server.post('/api/configuration/')
        .set("bearer", token)
        .send({
            name: cfgName1ToUse+"x",
            description: "testyNESTED",
            reloadtime: 33,
            cycletime: 5,
            urls: ["asdasd", "12314"],
        }).expect((res) => {
            console.log("PUT 1 CFG: " + res.body);
            console.log(res.body);
        })
        .expect(200)
        .end(done);
});
//}




it('get all configurations, ok', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});


it('post 1 configuration, ok', done => {
    server.post('/api/configuration/')
        .set("bearer", token)
        .send({
            name: cfgName1ToUse+"x",
            description: "testyNESTED",
            reloadtime: 33,
            cycletime: 5,
            urls: ["asdasd", "12314"],
        }).expect((res) => {
            console.log("PUT 1 CFG: " + res.body);
            console.log(res.body);
        })
        .expect(200)
        .end(done);
});

it('post 1 device, ok', done => {
    server.post('/api/device/')
        .set("bearer", token)
        .send({
            configurationId: null,
            name: 'testdevicess',
            description: 'devicey',
            approved: false,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
            console.log("PUT 1 DEVICE: " + res.body);
            console.log(res.body);
        }).expect(200)
        .end(done);
});

//GET ALL DEVICES and check that there are 2 now
it('get all devices, ok count 2', done => {
    server.get('/api/device')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});
//GET ALL DEVICES and check that there are 2 now
it('get all cfgs, ok count 2', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 3));
        })
        .expect(200, done);
});

it('update 1 device, ok', done => {
    server.put('/api/device/10')
        .set("bearer", token)
        .send({
            configurationId: 12,
            name: 'device-CC:40:D0:46:C3:82-mxtyl',
            description: 'devicey',
            approved: true,
            approvaltime: new Date(),
            apikey: null
        }).expect((res) => {
            console.log("PUT 1 DEVICE: " + res.body);
            console.log(res.body);
        })
        .expect(200)
        .end(done);
});*/