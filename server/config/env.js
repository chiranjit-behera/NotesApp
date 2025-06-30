var dotenv = require('dotenv');
dotenv.config();

var ENV = {
  MONGO_URL: process.env.MONGO_URL,
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  API_URL: process.env.API_URL,
};

module.exports = ENV;