const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas/schema');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { promisify } = require('util');

// GraphQL API
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        return {
            auth: async () => {
                try {
                    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
                        ? req.headers.authorization.split(' ')[1]
                        : null;
                    if (!token) return new AppError('You are not logged in. This action requires login.', 401);

                    const decoded = await jwt.verify(token, process.env.JWT_SECRET, (e, res) => (
                        e ? new AppError('Unfortunately we couldn\'t authenticate you, please, login.', 401) : res
                    ));

                    if (!decoded.id) return decoded;

                    const currentUser = await User.findById(decoded.id);
                    if (!currentUser) return new AppError('User does no longer exist', 401)

                    if (currentUser.changedPasswordAfter(decoded.iat)) {
                        return new AppError('You recently changed your password! Please login again.', 401)
                    }

                    req.user = currentUser;
                    return req.user._id
                } catch (e) {
                    return e
                }
            },
            req
        }
    },
    engine: {
        apiKey: process.env.APOLLO_ANALYTICS_API_KEY,
    }
});

module.exports = server