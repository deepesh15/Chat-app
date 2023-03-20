const dotenv = require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

module.exports = {
	MONGODB_URL,
	JWT_SECRET,
	CLIENT_URL,
};
