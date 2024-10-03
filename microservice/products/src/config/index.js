require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    DB_URI: process.env.DB_URI,
    APP_SECRET: process.env.APP_SECRET,
    MESSAGE_BROKER_URI: process.env.MESSAGE_BROKER_URI,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    QUEUE_NAME: process.env.QUEUE_NAME
}