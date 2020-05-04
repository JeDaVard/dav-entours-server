const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const mongoose = require('mongoose');
const app = require('./app');

mongoose
    .connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database is connected...');
        app.listen(process.env.PORT, () => {
            console.log(
                `Server is up on ${process.env.PORT} (${process.env.NODE_ENV})`
            );
        });
    })
    .catch((e) => {
        console.log(e);
    });
