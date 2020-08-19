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
                data,
                error: null,
            }
        } catch (error) {
            let customMessage = error.message || errorMessage

            if (error.code === 11000) customMessage = 'Already exists';

            return {
                code: error.code || errorCode,
                success: error.success || false,
                message: customMessage,
                data: null,
                isOperational: error.isOperational || true
            }
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

const simpleAsyncPaginated = resolver => {
    return async (parent, args, context, info) => {
        try {
            const result = await resolver(parent, args, context, info);

            return {
                total: result.totalDocs,
                hasMore: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                limit: result.limit,
                page: result.page,
                totalPages: result.totalPages,
                pagingCounter: result.pagingCounter,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                data: result.docs
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
    asyncPaginated,
    simpleAsyncPaginated
}