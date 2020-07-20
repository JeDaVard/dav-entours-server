const express = require('express');
const compression = require('compression')
const path = require('path');
const webhooks = require('./services/webhooks')
// const cors = require('cors');
const errorController = require('./middleware/error');
const cookieParser = require('cookie-parser');

const app = express();

// app.use(cors());

//// MIDDLEWARE \\\\
// MAIN
app.use(cookieParser());
app.use(compression());
app.use(express.json({
    limit: '20kb',
    //this is for req.rowBody in stripe webhooks
    verify: function(req, res, buf) {
        const url = req.originalUrl;
        if (url.startsWith('/webhooks/stripe')) {
            req.rawBody = buf.toString()
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'static')));

app.use('/webhooks', webhooks);

app.get('/ping', async (req, res) => {
    res.status(200).send('PONG')
})

app.use(errorController);


module.exports = app;
