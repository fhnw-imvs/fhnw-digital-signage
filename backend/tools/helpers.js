const crypto = require('crypto');
const {device}  = require("./../db/models/device");
module.exports = {
    authenticate: (retrievedSignature, ownSignature, data) => {
        const computedSignature = crypto.createHmac("sha256", Buffer.from(ownSignature, 'hex'))
            .update(Buffer.from("data", 'utf-8'))
            .digest("hex");

        return computedSignature === retrievedSignature;
    },
};
