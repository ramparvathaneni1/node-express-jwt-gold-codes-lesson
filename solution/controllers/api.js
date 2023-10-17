const express = require('express');
const router = express.Router();

const Auth = require('../models/auth');
const jwt = require('jsonwebtoken');
const jwtCheck = require('express-jwt');

router.post('/authorization', (req, res) => {
  // this is where you could do something like validate a username/password
  if (Auth.validate(req.body.username, req.body.password)) {
    // collect any information we want to include in the token, like the user's info
    const claims = {
      username: req.body.username,
      custom: 'any custom data'
    };

    // make a token & send it as JSON
    const options = {
      expiresIn: '2d'
    }
    const token = jwt.sign(claims, process.env.JWT_SECRET, options);

    res.json({
      user: claims,
      token: token
    });
  } else {
    // Send back an unauthorized response
    res.status(401).send('UnauthorizedError');
  }
});

router.get('/unprotected', (req, res) => {
  res.json({
    sky: 'blue'
  });
});

router.get('/gold_codes', jwtCheck({ secret: process.env.JWT_SECRET }), (req, res) => {
  const fakeCode = () => {
    return Math.random().toString(36).substr(2, 10).toUpperCase();
  }

  // As a security measure, only POTUS knows which of the codes are valid by their positions on the list
  res.json([
    fakeCode(),
    fakeCode(),
    fakeCode(),
    fakeCode(),
    fakeCode(),
    fakeCode(),
    'HWCK827UG6',
    fakeCode(),
    'SVSI2SL0YM',
    fakeCode()
  ]);
});

module.exports = router;
