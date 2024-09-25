require('dotenv').config();
const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');
    } catch (error) {
        console.log('Error =====', error);
        process.exit(1);
    }
};
