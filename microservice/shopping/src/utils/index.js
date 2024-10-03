const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { APP_SECRET, SHOPPING_BINDING_KEY, MESSAGE_BROKER_URI, EXCHANGE_NAME, QUEUE_NAME } = require('../config');
const amqplib = require('amqplib');

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
    return jwt.sign(payload, APP_SEC, {
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

module.exports.PublishMessage = (channel, service, message) => {
    try {
        channel.publish(EXCHANGE_NAME, service, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to ${service} service`);
    } catch(err){
        throw err;
    }
}

//Subscribe messages
module.exports.SubscribeMessage = async (channel, service) => {
    try {
        await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
        const queue = await channel.assertQueue(QUEUE_NAME, "direct", { durable: true });

        console.log(`Waiting for messages from ${service} service...`);

        channel.bindQueue(queue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);

        channel.consume(queue.queue, (message) => {
           if(message.content){
               console.log(`Received message from ${service} service: ${message.content.toString()}`);
               service.SubscribeEvents(message.content.toString());
           }
           console.log(`Message received from ${service} service: ${message.content.toString()}`);
        },
        {
            noAck: true
        });
    } catch(err){
        throw err;
    }
}