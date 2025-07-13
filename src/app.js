const express = require('express');
const path = require('path');

const logger = require('./middlewares/logger');

const indexRouter = require('./routes/index');
const commandRouter = require('./routes/command');
const resultRouter = require('./routes/result');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/results', express.static(path.join(process.cwd(), 'results')));

app.use('/', indexRouter);
app.use('/command', commandRouter);
app.use('/result', resultRouter);

// Logger.
app.use(logger);

module.exports = app;
