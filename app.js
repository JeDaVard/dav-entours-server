const express = require('express');
const path = require('path');
// const expressGraphQL = require('express-graphql');
// const schema = require('./schema/schema');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const AppError = require('./utils/appError');
const { typeDefs, resolvers } = require('./Schemas/schema');
const errorController = require('./middleware/error');
const tourAPI = require('./apis/tour');
const userAPI = require('./apis/user');
const reviewAPI = require('./apis/review');

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const app = express();

app.use(cors());

server.applyMiddleware({ app });
// Express graphQl
// app.use('/graphql', expressGraphQL({
//     schema,
//     graphiql: true,
// }))

//// MIDDLEWARE \\\\
// SECURITY
//Implementing cors
//Access-Control-Allow-Origin
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader(
    //     'Access-Control-Allow-Methods',
    //     'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    // );
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });
// MAIN
app.use(cookieParser());
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'static')));

// APIs
app.use('/api/tour', tourAPI);
app.use('/api/user', userAPI);
app.use('/api/review', reviewAPI);

// Error middleware
app.all('*', (req, res, next) => {
    next(new AppError('Not found!'));
});

app.use(errorController);


module.exports = app;
