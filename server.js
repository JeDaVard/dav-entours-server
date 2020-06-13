const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const { createServer } = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const server = require('./graphql/server')
const AppError = require('./utils/appError');

server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer)

// Error middleware
app.all('*', (req, res, next) => {
    next(new AppError('Not found!', 404));
});

mongoose
    .connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database is connected...');
        httpServer.listen(process.env.PORT, () => {
            console.log(
                `Server is up on ${process.env.PORT} (${process.env.NODE_ENV})`
            );
            console.log(`WS transport on ${server.subscriptionsPath}`)
        });
    })
    .catch((e) => {
        console.log(e);
    });

