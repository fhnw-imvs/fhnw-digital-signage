const request = require('supertest');
const crypto = require('crypto');

const server = request('http://localhost:1337');
let token = "";
const deviceName1ToUse  = crypto.randomBytes(10).toString('hex');
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
for (let i = 0; i < 1_000; i++) {

    let devicename = crypto.randomBytes(10).toString('hex');
    it('post 1 configuration correct, ok', done => {
        server.post('/api/configuration/')
            .set("bearer", token)
            .send({
                name: devicename,
                description: deviceName1ToUse + "POSTdesc",
                reloadtime: 2312313,
                cycletime: 2222222,
                urls: ["asdasd", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314", "12314"],
            }).expect((res) => {
            console.log(JSON.stringify(res.body, null, 4));
        })
            .expect(200)
            .end(done);
    });
}
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