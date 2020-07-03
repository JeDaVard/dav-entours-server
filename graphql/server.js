const { ApolloServer } = require('apollo-server-express');
const { root, me, tour, conversation } = require('./')
const { rootSchema, meSchema, userSchema, tourSchema, reviewSchema, conversationSchema } = require('./')
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { makeExecutableSchema } = require('graphql-tools');
// const { mergeSchemas, mergeSchemasAsync } = require('graphql-tools');


const executableSchema = makeExecutableSchema({
    typeDefs: [rootSchema, meSchema, userSchema, tourSchema, reviewSchema, conversationSchema],
    resolvers: [root, me, tour, conversation],
});

// const schema = mergeSchemas({
//     schemas: [executableSchema]
// })
// const { promisify } = require('util');

const contextMid = ({req, res, error, user, connection}) => ({req, res, error, user, connection})

// GraphQL API
const server = new ApolloServer({
    schema: executableSchema,
    context: async ({req, res, connection}) => {
        try {
            if (connection) {
                // contextMid({connection})
                return connection.context
            } else {
                const token = req.cookies.authToken;
                console.log('cookies', typeof req.cookies, req.cookies, 'cookies')
                if (!token) return contextMid({req, res});

                const decoded = await jwt.verify(token, process.env.JWT_SECRET, (e, payload) => e || payload);
                if (!decoded.id) return contextMid({req, res,
                    error: {message: 'Unfortunately we couldn\'t authenticate you, please, login.'}})

                const currentUser = await User.findById(decoded.id);
                if (!currentUser) return contextMid({req, res,
                    error: {message: 'User does no longer exist.'}})
                if (currentUser.changedPasswordAfter(decoded.iat)) return contextMid({req, res,
                        error: {message: 'You recently changed your password! Please login again.'}})

                return contextMid({req, res, user: currentUser})
            }
        } catch (error) {
            console.log(error)
            return contextMid({
                req,
                error
            })
        }
    },
    subscriptions: {
        onConnect: async (connectionParams, webSocket, context) => {
            try {
                const token = connectionParams.authorization && connectionParams.authorization.startsWith('Bearer')
                    ? connectionParams.authorization.split(' ')[1]
                    : null;

                const decoded = await jwt.verify(token, process.env.JWT_SECRET, (e, payload) => e || payload);

                const user = await User.findById(decoded.id);
                return {
                    user
                }
            } catch (e) {
                return new AppError('Some error while authenticate in WS')
            }
        },
        onDisconnect: (webSocket, context) => {
            // console.log('disconnected')
        },
    },
    engine: {
        apiKey: process.env.APOLLO_ANALYTICS_API_KEY,
    }
});

module.exports = server