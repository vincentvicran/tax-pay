const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const app = express();

//* environment variables
// require('dotenv/config');
// Setting up config file
if (process.env.NODE_ENV !== 'production')
    require('dotenv').config({ path: '.env' });

const api = process.env.API_URL;
const port = process.env.PORT;
// var authJwt = require('./helpers/jwt');
// var errorHandler = require('./helpers/error-handler');
const AppError = require('./backend/helpers/appError');
const globalErrorHandler = require('./backend/controllers/errorController');

app.use(cors());
app.options('*', cors());

//* GLOBAL MIDDLEWARE
// reading data from the body into req.body
app.use(bodyParser.json());

// set security HTTP headers00
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

//* HTTP loggers details
// development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limiting request from same API
const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Request limit reached! Please try again in an hour!',
});
app.use('/api', limiter);

//? serving static files
console.log(process.env.NODE_ENV);
// app.use('/', express.static(path.join(__dirname, `/`)));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend/build', 'index.html'));
    });
}

//? data sanitization against NoSQL query injection
app.use(mongoSanitize());

//? data sanitization against XSS
app.use(xss());

//* importing routes
const usersRoutes = require('./backend/routes/users');
const vehiclesRoutes = require('./backend/routes/vehicles');
const paymentsRoutes = require('./backend/routes/payments');
const insurancesRoutes = require('./backend/routes/insurances');
const adminRoutes = require('./backend/routes/admin');

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/vehicles`, vehiclesRoutes);
app.use(`${api}/payments`, paymentsRoutes);
app.use(`${api}/insurances`, insurancesRoutes);
app.use(`${api}/admin`, adminRoutes);

//* error handling
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

//* database connection
mongoose
    .connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        dbName: 'TaxDB',
    })
    .then(() => {
        console.log('Database Connection is ready...');
    })
    .catch((err) => {
        console.log(err);
    });

//* starting the server
app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});
