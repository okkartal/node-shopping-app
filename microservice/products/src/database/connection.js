const mongoose = require('mongoose');
const { DB_URI } = require('../config');

module.exports = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('DB Connected');
    } catch (error) {
        console.log('Error =====', error);
        process.exit(1);
    }
};
