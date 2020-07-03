const express = require('express');
const path = require('path');
// const cors = require('cors');
const errorController = require('./middleware/error');
const cookieParser = require('cookie-parser');

const app = express();

// app.use(cors());

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

app.use(errorController);


module.exports = app;
