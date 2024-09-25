const express = require('express');
require('dotenv').config();
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async() => {
    const app = express();

    await databaseConnection();

    await expressApp(app);

    app.listen(process.env.PORT, () => {
        console.log(`listening to port ${process.env.PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();