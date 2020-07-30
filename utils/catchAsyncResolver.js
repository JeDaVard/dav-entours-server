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

// Use as a sync function, call synchronously to get a query
// Otherwise it returns a promise and resolves so you get Mongoose docs instead
const asyncPaginated = ( model, resolver ) => {
    return async (parent, args, context, info) => {
        try {
            const query = resolver(parent, args, context, info);
            const options = {
                page: args.page || 1,
                limit: args.limit || 0
            };
            const data = await model.paginate(query, options);

            return {
                hasMore: data.hasNextPage,
                nextPage: data.nextPage,
                total: data.totalDocs,
                data: data.docs
            }
        } catch (e) {
            throw new ApolloError(
                (process.env.NODE_ENV === 'development') ? e.message : 'Oops.. Something went wrong'
                , '500'
            )
        }
    }
}

module.exports = {
    catchAsyncResolver,
    asyncPaginated
}