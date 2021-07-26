const linkMangoDB = "";

const express = require('express');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

mongoose.connect(linkMangoDB,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connection to MongoDB successful!'))
  .catch(() => console.log('Connection to MongoDB failed!'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
  
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // start blocking after 20 requests
  message:
    "Too many accounts created from this IP, please try again after an hour"
});
app.use('/api/auth/signup', createAccountLimiter)

const loginAccountLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min window
  max: 20, // start blocking after 20 requests
  message:
    "Too many connection attempts from this IP address, please try again after five minutes"
});
app.use('/api/auth/login', loginAccountLimiter)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs && ip
  message:
    "Too many connection attempts from this IP address!"
});
app.use('/api/sauces', limiter)

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;