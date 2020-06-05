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
    context: ({req}, res) => {
        return {
            auth: async () => {
                const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
                    ? req.headers.authorization.split(' ')[1]
                    : null;
                if (!token) return new AppError('You are not logged in. This action requires login.', 401);

                const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

                const currentUser = await User.findById(decoded.id);
                if (!currentUser) return new AppError('User does no longer exist', 401)

                if (currentUser.changedPasswordAfter(decoded.iat)) {
                    return new AppError('You recently changed the password! Please login again.', 401)
                }

                req.user = currentUser;
                return req.user
            },
            req,
            res
        }
    },
    engine: {
        apiKey: process.env.APOLLO_ANALYTICS_API_KEY,
    }
});

module.exports = server