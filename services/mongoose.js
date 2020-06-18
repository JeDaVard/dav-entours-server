const mongoose = require('mongoose');
const redis = require('./redis');

// clear all in all db
// redis.flushall(console.log)

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(
    options = { expiration: 3600000, hashKey: ''}
    ) {
    this.useCache = true;
    this.expiration = options.expiration * 24 * 60 * 60 * 1000;
    this.hashKey = JSON.stringify(options.hashKey)
    return this
}

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) return exec.apply(this, arguments)
    const keyString = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cachedData = await redis.hget(this.hasKey, keyString);
    if (cachedData) {
        const doc = JSON.parse(cachedData);

        return Array.isArray(doc)
            ? doc.map( d => new this.model(d))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments);
    redis.hset(this.hashKey, keyString, JSON.stringify(result), 'EX', this.expiration)
    return result
}

exports.clearHash = function(hashKey) {
    redis.del(JSON.stringify(hashKey))
}

module.exports = mongoose
    .connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })