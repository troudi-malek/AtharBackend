var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const AdminRoutes = require('./routes/admin');
const museumRoutes = require('./routes/museum');
const superAdminRoutes = require('./routes/superAdmin');
const codeRoutes = require('./routes/code');
const experienceRoutes = require('./routes/experience');
const UserMuseumAccess = require('./routes/UserMuseumAccess');
const passwordResetRoutes = require('./routes/passwordReset');
const leaderboardRoutes = require('./routes/leaderboard');

var app = express();

// --- CORS (must be registered before routes) ---
app.use(cors({
  origin: 'https://athardashbaord.vercel.app',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- Core middleware ---
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Cached MongoDB connection (serverless-safe) ---
// Prevents reconnecting on every invocation and avoids the
// "buffering timed out" error caused by querying before connect() resolves.
let cached = global.mongooseConn;
if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request instead of staying broken
    throw err;
  }
  return cached.conn;
}

// Ensure DB is connected before any route handler runs
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.status(500).json({ error: 'Database connection failed' + err.message });
  }
});

// --- Routes ---
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

// --- 404 handler ---
app.use(function (req, res, next) {
  next(createError(404));
});

// --- Error handler (JSON, not jade view) ---
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// --- Local dev server only; Vercel handles this via serverless functions ---
if (!process.env.TEST_ENV && !process.env.VERCEL) {
  const server = http.createServer(app);
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

module.exports = app;