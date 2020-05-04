const express = require('express');
const path = require('path');

const tourAPI = require('./apis/tour');
const authAPI = require('./apis/auth');
const userAPI = require('./apis/user');
const reviewAPI = require('./apis/review');

const app = express();

//// MIDDLEWARE \\\\
// SECURITY
// MAIN
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'static')))


// APIs
app.use('/api/tour', tourAPI);
app.use('/api/auth', authAPI);
app.use('/api/user', userAPI);
app.use('/api/review', reviewAPI);

// app.all('*', (req, res, next) => {
//     next(new AppError('Not found!'));
// });

module.exports = app;
