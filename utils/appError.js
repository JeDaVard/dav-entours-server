const { ApolloError } = require('apollo-server-express')

class AppError extends ApolloError {
    constructor(message, statusCode, error) {
        super(message);

        this.isOperational = true;
        this.code = statusCode;
        this.success = false;
        this.message = message;
        this.data = null;
        this.error = error;

        // ApolloError.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;