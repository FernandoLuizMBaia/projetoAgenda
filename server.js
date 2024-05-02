require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING)
    .then(() => {
        app.emit('pronto');
    })
    .catch(e => console.log(e));
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const routes = require('./routes');
const path = require('path');

//const helmet = require('helmet'); // helmet começou a causar problemas no localhost por conta da falta de SSL

const csrf = require('csurf');
const { middlewareGlobal, checkCsrfError, csrfMiddleware }= require('./src/middlewares/middleware');

// app.use(helmet()); // helmet começou a causar problemas no localhost por conta da falta de SSL

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'public')));

const mongooseConnection = mongoose.connection;
const sessionOptions = session({
    secret: 'chupacabraralada elavada a 4 divindade oniparaduzenti',
    store: MongoStore.create({
        mongooseConnection,
        mongoUrl: process.env.CONNECTIONSTRING,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());
// Nossos proprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.on('pronto', () => {
    app.listen(3333, () => {
        console.log('acessar http://localhost:3333');
        console.log('Sevidor executando na porta 3333');
    });
});
