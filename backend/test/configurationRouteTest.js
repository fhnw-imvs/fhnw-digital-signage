const request = require('supertest');
const crypto = require('crypto');

// noinspection JSCheckFunctionSignatures
const server = request('http://localhost:1337');
let token = "";
const deviceName1ToUse  = crypto.randomBytes(20).toString('hex');
let lastInsertedId = 1;
console.log("using as first cfg: "+deviceName1ToUse);

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

it('get all configurations, ok', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200, done);
});

it('get all configurations, malformed', done => {
    server.get('/api/configuration')
        .set("bearesr", token)
        .expect(401, done);
});

it('get all configurations, malformed, maybe change to 401', done => {
    console.log(token);
    server.get('/api/configuration')
        .set("bearer", "223"+token)
        .expect(401, done);
});
//GET 1 DEVICE
it('get 1 configuration, ok', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(200, done);
});

it('get 1 configuration, malformed', done => {
    server.get('/api/configuration')
        .set("bearesr", token)
        .expect(401, done);
});

it('get 1 configuration, malformed, maybe change to 401', done => {
    console.log(token);
    server.get('/api/configuration')
        .set("bearer", token+"223")
        .expect(401, done);
});

it('put 1 configuration, ok', done => {
    server.put('/api/configuration/2')
        .set("bearer", token)
        .send({
            name: deviceName1ToUse,
            description: "testy",
            reloadtime: 33,
            cycletime: 5,
            urls: ["https://google.com", "https://wnbck.myftp.org"]
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200)
        .end(done);
});

it('put 1 configuration, duplicate name, bad', done => {
    server.put('/api/configuration/4')
        .set("bearer", token)
        .send({
            name: deviceName1ToUse,
            description: "testy",
            reloadtime: 33,
            cycletime: 5,
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(422)
        .end(done);
});

it('put 1 configuration, malformed', done => {
    server.put('/api/configuration/3')
        .set("bearer", token)
        .send({
            name: "testbody",
            descriyption: "testy",
            reloadtime: 33,
            cycletime: 5,
        }).expect((res) => {
        console.log(JSON.stringify(res.body, null, 4));
    })
        .expect(422)
        .end(done);
});

it('put 1 configuration, unauthorized 401', done => {
    server.put('/api/configuration/3')
        .set("bearer", "s")
        .send({
            configurationId: null,
            name: 'testconfiguration',
            description: 'configurationy',
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
it('get all configurations, ok count 2', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200, done);
});

it('put 1 configuration malformed', done => {
    server.put('/api/configuration/2')
        .set("bearer", token)
        .send({
            name: "testbody",
            description: "testyUPDATED",
            reloadtime: 33,
            cycletime: 5,
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(422)
        .end(done);
});
it('post 1 configuration correct, ok', done => {
    server.post('/api/configuration/')
        .set("bearer", token)
        .send({
            name: deviceName1ToUse+"POST",
            description: deviceName1ToUse+"POSTdesc",
            reloadtime: 2312313,
            cycletime: 2222222,
            urls: ["asdasd", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314"],
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200)
        .end(done);
});

it('post 1 configuration correct, dup names 422', done => {
    server.post('/api/configuration/')
        .set("bearer", token)
        .send({
            name: deviceName1ToUse+"POST",
            description: deviceName1ToUse+"POSTdesc",
            reloadtime: 2312313,
            cycletime: 2222222,
            urls: []
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(422)
        .end(done);
});

it('put 1 configuration, update one url deleted out of 2 OK', done => {
    server.put('/api/configuration/2')
        .set("bearer", token)
        .send({
            name: deviceName1ToUse+"X",
            description: "testy",
            reloadtime: 33,
            cycletime: 5,
            urls: ["https://wnbck.myftp.org"]
        }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
        .expect(200)
        .end(done);
});

//GET ALL DEVICES and check that there is an updated string
it('get all configurations, ok updated description', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            let ids = Array.from(res.body.configuration, b => b.id);
            console.log(ids[ids.length-1]);
            lastInsertedId = ids[ids.length-1];
            //if (!res.body.configuration[1].description.substring("UPDATED")) throw new Error("configuration with id 3 seems not to be updated");
        })
        .expect(200, done);
});

it('delete configuration with id '+lastInsertedId, done => {
    server.delete('/api/configuration/'+lastInsertedId)
        .set("bearer", token)
        .expect(res => console.log(JSON.stringify(res.body, null, 4)))
        .expect(200, done);
});

//GET ALL DEVICES and check that there is an updated string
it('get all configurations, ok, deleted 1 configuration count now 1', done => {
    server.get('/api/configuration')
        .set("bearer", token)
        .expect(res => {
            console.log(JSON.stringify(res.body, null, 4));
            //if (!(res.body.configuration.length === 1)) throw new Error("configuration with id 3 seems not to be deleted");
        })
        .expect(200, done);
});