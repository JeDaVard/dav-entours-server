const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const errorController = require('./middleware/error');
const tourAPI = require('./apis/tour');
const userAPI = require('./apis/user');
const reviewAPI = require('./apis/review');

const app = express();

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
app.use(cors())
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
