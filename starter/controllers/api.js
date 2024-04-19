const jwt = require('jsonwebtoken');
const jwtCheck = require('express-jwt');
const express = require('express');
const router = express.Router();

const Auth = require('../models/auth');

router.post('/authorization', (request, response) => {
    // validate username/password
    // collection info we want to include in token like user info
    // make a token and send it as JSON

    // Use the Auth model we've created to validate username and password
    if (Auth.validate(request.body.username, request.body.password)) {
        
        // Data in the payload
        const claims = {
            username: request.body.username,
            name: 'John Doe',
            age: 30,
            amount: 100_000
        };

        // Options object for token expiration
        const options = {
            expiresIn: '2d'
        }

        // Make the Token
        const token = jwt.sign(claims, process.env.JWT_SECRET, options);

        // Send response, data + token
        response.render('loggedin', {
            user: claims,
            token: token
        });

    } else {
        // Send back Unauthorized response
        response.status(401).send("UnauthorizedError");
    }
});

router.get('/unprotected', (request, response) => {
    response.json({
        sky: 'The sky is blue'
    });
});

router.get('/gold_codes', jwtCheck({ secret: process.env.JWT_SECRET }), (request, response) => {
    const fakeCode = () => {
        return Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();
    };

    response.json([
        fakeCode(),
        fakeCode(),
        fakeCode(),
        fakeCode(),
        fakeCode(),
        fakeCode(),
        'HlNUK3MlG6',
        fakeCode(),
        'SlB0O0MlYM',
        fakeCode()
    ]);
});

module.exports = router;
