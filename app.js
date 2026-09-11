var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const http = require('http');
const mongo = require("mongoose");
require('dotenv').config();
var indexRouter = require('./routes/index');


var app = express();
app.use(cors({
  origin: 'https://athardashbaord.vercel.app',
  credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
console.log("MONGO_URI", process.env.MONGO_URI);
mongo.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });


//Routes
const usersRouter = require('./routes/users');
const AdminRoutes = require("./routes/admin")
const museumRoutes = require('./routes/museum');
const superAdminRoutes = require('./routes/superAdmin');
const codeRoutes = require('./routes/code');
const experienceRoutes = require('./routes/experience');
const UserMuseumAccess = require('./routes/UserMuseumAccess')
const passwordResetRoutes = require('./routes/passwordReset');
const leaderboardRoutes = require('./routes/leaderboard');
//end Routes

const server = http.createServer(app);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/museum', museumRoutes);
app.use('/admin', AdminRoutes);
app.use('/superAdmin', superAdminRoutes);
app.use('/code', codeRoutes);
app.use('/experience', experienceRoutes);
app.use('/UserMuseumAccess', UserMuseumAccess);
app.use('/password-reset', passwordResetRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});


if (!process.env.TEST_ENV) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on port : ${port}`);
  });
}




module.exports = app;
