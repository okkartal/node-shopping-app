const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.GenerateSalt = async () => {
    return await bcrypt.genSalt();
}

module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
}

module.exports.ValidatePassword = async (
    enteredPassword,
    savedPassword,
    salt
) => {
    return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
}

module.exports.GenerateSignature = async (payload) => {
    return jwt.sign(payload, process.env.APP_SECRET, {
        expiresIn: '30d'
    });
}

module.exports.ValidateSignature = async (req) => {
    const signature = req.get('Authorization');

    if (!signature) return false;

    const payload = await jwt.verify(signature.split(' ')[1], process.env.APP_SECRET);
    req.user = payload;
    return true;
}

module.exports.FormateData = (data) => {
    if (data) {
        return {
            data
        };
    }
    return { msg:'Data Not Found'};
}
