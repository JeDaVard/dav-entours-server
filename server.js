const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const { createServer } = require('http');
const mongoose = require('./services/mongoose');
const app = require('./app');
const server = require('./graphql')
const AppError = require('./utils/appError');
const redis = require('./services/redis');

const cors = {
        credentials: true,
        origin: (origin, callback) => {
            console.log(process.env.NODE_ENV, process.env.CLIENT, 'envs')
            if (process.env.NODE_ENV === 'development') return callback(null, true);
            if (process.env.NODE_ENV === 'production') return callback(null, true);
            const whitelist = [
                process.env.CLIENT,
            ];

            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new AppError("Not allowed by CORS", 403))
            }
        }
        // origin: 'http://localhost:3000',
        // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        // preflightContinue: false,
        // optionsSuccessStatus: 204,
    }

server.applyMiddleware({ app, cors });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer)

// Error middleware
app.all('*', (req, res, next) => {
    next(new AppError('Not found!', 404));
});

mongoose
    .then(() => {
        console.log('Database is connected...');
        httpServer.listen(process.env.PORT, () => {
            console.log(`Redis status is ${redis.status}...`)
            console.log(`WebSocket transport is on ${server.subscriptionsPath}`);
            console.log(`Server is up on ${process.env.PORT} (${process.env.NODE_ENV})` );
        });
    })
    .catch((e) => {
        console.log(e);
    });
