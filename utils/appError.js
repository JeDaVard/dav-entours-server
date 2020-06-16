const { ApolloError } = require('apollo-server-express')

class AppError extends ApolloError {
    constructor(message, statusCode) {
        super(message);

        this.code = statusCode;
        this.isOperational = true;

        // ApolloError.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;