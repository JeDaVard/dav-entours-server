const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const { root, me, tour, conversation } = require('./')
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { makeExecutableSchema } = require('@graphql-tools/schema')

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: [root, me, tour, conversation],
});
// const { promisify } = require('util');

const contextMid = (req, error, user, connection) => ({
    req,
    error,
    user,
    connection
})

// GraphQL API
const server = new ApolloServer({
    schema,
    context: async ({req, connection}) => {
        try {
            if (connection) {
                // contextMid(null, null, null, connection.context)
                return connection.context
            } else {
                const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
                    ? req.headers.authorization.split(' ')[1]
                    : null;
                if (!token) return contextMid(req)

                const decoded = await jwt.verify(token, process.env.JWT_SECRET, (e, payload) => e || payload);
                if (!decoded.id) return contextMid(req, {message: 'Unfortunately we couldn\'t authenticate you, please, login.'})

                const currentUser = await User.findById(decoded.id);
                if (!currentUser) return contextMid(req, {message: 'User does no longer exist.'})

                if (currentUser.changedPasswordAfter(decoded.iat)) {
                    return contextMid(req, {message: 'You recently changed your password! Please login again.'})
                }

                return contextMid(req, null, currentUser)
            }
        } catch (error) {
            return contextMid(req , error)
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
                console.log(e)
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