require('dotenv').config({ silent: true });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ejsLayouts = require('express-ejs-layouts');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejsLayouts);

app.use('/', require('./controllers/index'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  let errStatus = err.status || 500;
  let errMessage = 'Server Error';

  if (err.name === 'UnauthorizedError') {
    errStatus = 401;
    errMessage = 'You need an authorization token to view confidential information.';
  }

  res.status(errStatus).json({
    status: errStatus,
    message: errMessage
  });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server started on port %s', port);
});

module.exports = server;
