const { ApolloError } = require('apollo-server-express')

const catchAsyncResolver = (resolver, code, message, errorCode, errorMessage) => {
    return async (parent, args, context, info) => {
        try {
            const data = await resolver(parent, args, context, info);

            return {
                code,
                success: true,
                message,
                data
            }
        } catch (e) {
            throw new ApolloError(errorMessage || e.message, errorCode || 500)
        }
    }
}

module.exports = {
    catchAsyncResolver
}