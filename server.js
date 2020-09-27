const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const { createServer } = require('http');
const mongoose = require('./loaders/mongoose');
const app = require('./app');
const server = require('./graphql')
const AppError = require('./utils/appError');
const redis = require('./loaders/redis');


const cors = {
        credentials: true,
        origin: (origin, callback) => {
            if (process.env.NODE_ENV === 'development') return callback(null, true);
            const whitelist = [
                process.env.CLIENT,
                'http://localhost:3000'
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

// Any route middleware
app.all('*', async (req, res, next) => {
    // try {
    //     res.redirect(process.env.CLIENT)
    // } catch (e) {
    //     next(new AppError('Not found!', 404));
    // }
    res.status(403).send('My custom error')
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
