const express = require('express');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { PORT } = require('./config');
const { CreateChannel } = require('./utils');

const StartServer = async() => {
    const app = express();

    await databaseConnection();

    const channel = await CreateChannel();

    await expressApp(app, channel);

    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();