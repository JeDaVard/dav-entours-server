const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URI, {connectTimeout: 2000})

module.exports = redis;