const { ApolloError } = require('apollo-server-express')

const catchAsyncResolver = (
    resolver,
    code = '200',
    message = 'Done Successfully!',
    errorCode = '400',
    errorMessage = 'Error while handling the request'
) => {
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
            throw new ApolloError(
                !(process.env.NODE_ENV === 'development') ? errorMessage : e.message
                , errorCode
            )
        }
    }
}

module.exports = {
    catchAsyncResolver
}