const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqplib = require('amqplib');
const { EXCHANGE_NAME, MESSAGE_BROKER_URI, APP_SECRET, QUEUE_NAME } = require('../config');

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
    return jwt.sign(payload, APP_SECRET, {
        expiresIn: '30d'
    });
}

module.exports.ValidateSignature = async (req) => {
    const signature = req.get('Authorization');

    if (!signature) return false;

    const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
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

/***********************MESSAGE BROKER *************** */

//Create a channel
module.exports.CreateChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URI);
        const channel = await connection.createChannel();
        await channel.assertQueue(EXCHANGE_NAME, 'direct', { durable: true });
        return channel;
    } catch(err){
        throw err;
    }
};

//Publish messages
module.exports.PublishMessage = async (channel, binding_key, message) => {
     try {
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to ${binding_key} service: ${JSON.stringify(message)}`);
     } catch(err){
        throw err;
     }
};