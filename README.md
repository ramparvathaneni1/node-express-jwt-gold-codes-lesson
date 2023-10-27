# API Authentication with JWT

- [API Authentication with JWT](#api-authentication-with-jwt)
    - [Learning Objectives](#learning-objectives)
  - [Intro](#intro)
    - [Kicking it up a notch](#kicking-it-up-a-notch)
      - [Just like cookies, mmmm....](#just-like-cookies-mmmm)
  - [Codealong](#codealong)
      - [Set-up](#set-up)
      - [Create API Controller](#create-api-controller)
      - [Create an Auth model](#create-an-auth-model)
      - [Protected Routes](#protected-routes)
  - [Accessing Protected Endpoints with AJAX](#accessing-protected-endpoints-with-ajax)
  - [Resources](#resources)

### Learning Objectives

- Understand why authentication tokens are commonly used when interacting with APIs
- Add a token strategy to an application
- Authenticate a user based on their token

## Intro

When building APIs, authentication is crucial. When building an API, you're often giving access to private, sometimes sensitive information, and we do not want to be responsible for secrets falling into the wrong hands. It's hard to be too careful, so today, we're going to learn a way to control access to an API that is both simple and secure.

The technique we're going to use today revolves around **tokens**. Tokens are, at their simplest, a unique string that is usually auto-generated. It needs to be long & complex enough that a human would never guess it, and unique enough that only one user in the database can have any particular one.

If we trust that we've designed it that way, then we only have to use a single string of characters to determine both who a user is claiming to be in our database, and that they are who they say they are.

### Kicking it up a notch

That's the overall gist of what tokens do, but today we're going to use a specific type of token. It's a fairly new type of token, that's becoming widely used and trusted in web applications, and it's called a **JSON Web Token** or JWT (pronounced `jot`, if you can believe that).

It is the same idea – a single string of characters to authenticate – but this token isn't just _random_ characters, it's a string of characters that's built by encrypting actual information.

You can play with encoding/decoding the data over at their site as an example. Head on over to [jwt.io](http://jwt.io/#debugger) and see what I mean:

<img width="750" alt="JWTs" src="https://cloud.githubusercontent.com/assets/25366/9151601/2e3baf1a-3dbc-11e5-90f6-b22cda07a077.png">

#### Just like cookies, mmmm....

In the example above, you'll notice that there are 3 parts. The payload is the one we care the most about, and it holds whatever data we decide to put in there. It's very much like a cookie; we put as few things in there as possible – just the pieces we really need.

Applications can save a JWT somewhere on a user's computer, just like a cookie. Because JWTs can be encrypted into a single string, we can _also_ send it over HTTP really, really easily. Which means it'll work in any server/client scenario you can imagine. Quite nice.

## Codealong

**NOTE - if you get a message that a port is in use, you can kill it with this command: `sudo kill -9 $(sudo lsof -t -i:3000)`**

- Replace `3000` with the port number you want to stop.
- [Reference](https://tecadmin.net/kill-process-on-specific-port/)

#### Set-up

1. git clone this repo then `cd` into the starter code folder.

1. npm install a few packages: `npm install jsonwebtoken express-jwt`

1. We're using an npm package called `dotenv` to set up an environment variable secret key for our token. In the root of the starter folder, `touch .env` and add the `JWT_SECRET` below (_it could be anything_).

    ```js
    JWT_SECRET='somethingsupersecretandhardtoguess'
    ```

1. You can start your server with `nodemon app.js`. In the browser, go to `localhost:3000` and you should see this.

    ![](./assets/express-starter.png)



#### Create API Controller

1. Create an API controller, **/controllers/api.js**. Create a route within the API controller to issue auth tokens.

    ```js
    // controllers/api.js
    const jwt = require('jsonwebtoken'); // sign, issue, verify JWT tokens 
    const jwtCheck = require('express-jwt'); // middleware for checking JWT signature
    const express = require('express');
    const router = express.Router();

    router.post('/authorization', (req, res) => {
      // this is where you could do something like validate a username/password

      // collect any information we want to include in the token, like the user's info

      // make a token & send it as JSON
    });

    module.exports = router;
    ```

1. Add the following `require` functions at the top of **controllers/api.js**

    ```js
    // controllers/api.js
    // ...

    const jwt = require('jsonwebtoken'); // sign, issue, verify JWT tokens 
    const jwtCheck = require('express-jwt'); // middleware for checking JWT signature

    // ...
    ```

1. We need to let the rest of the application know about the new api controller, so we wire it up in **app.js** (*not* `api.js`).

    ```js
    // app.js
    // ...

    //Add the following directly under app.use('/', require('./controllers/index'));
    app.use('/api', require('./controllers/api'));

    // ...
    ```

#### Create an Auth model 

1. Create a `models/auth.js` file and add this `validate` method. __NOTE-__ for this lesson the username is `admin` and the password is `securepassword`.

    ```js
    // models/auth.js
    class Auth {
      static validate(username, password) {
        // We could validate the username/password from a database instead here
        return (username === 'admin' && password === 'securepassword');
      }
    }

    module.exports = Auth;
    ```

1. In `controllers/api` add to the `/authorization` route. We will accept the username and password received from the browser form (for this exercise we've hardcoded the username and password in the auth model). 

    Add in claims, which will get baked into the token. If there's a valid login attempt create a new token, send the token back for client to store. Ensure your `api.js` now looks like the following:

    ```js
    // controllers/api.js
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
        const token = jwt.sign(claims, process.env.JWT_SECRET);

        res.json({
          user: claims,
          token: token
        });
      } else {
        // Send back an unauthorized response
        res.status(401).send('UnauthorizedError');
      }
    });

    module.exports = router;
    ```

2. Run our code and decode the JWT on [jwt.io](https://jwt.io). Note - To verify the token, add the `JWT_SECRET` to the VERIFY SIGNATURE field on the right of the webpage.

    ```js
    {
      "username": "admin",
      "custom": "any custom data",
      "iat": 1505844942
    }
    ```

3. This is essentially an "infinite" access token because it technically never expires unless we change out secret or delete it from our database. We should limit how long an access token is valid in order to decrease the chance of this token being compromised sometime in the future. 

    To do that, we'll add in an expiration time also in our `api.js`. In your router's authorization endpoint, add the following:

      ```js
      const options = {
        expiresIn: '2d'
      }
      ```

      Change the following line
      ```js
      const token = jwt.sign(claims, process.env.JWT_SECRET);
      ```

      To this:
      ```js
      const token = jwt.sign(claims, process.env.JWT_SECRET, options);
      ```

      Relogin to the app and take a look at our JWT decoded now: 

      ```js
      {
        "username": "admin",
        "custom": "any custom data",
        "iat": 1505844822,
        "exp": 1506017622
      }
      ```

#### Protected Routes

To create any unprotected routes that don't require authorization, just continue writing routes as we have been. 

```js
// controllers/api.js
router.get('/unprotected', (req, res) => {
  res.json({
    sky: 'blue'
  });
});
```

To access protected routes though, a client have to send us the JWT we issued within the headers. Let's create a protected route. Here we'll use `express-jwt` middleware to do two things: 

- Verify the token sent is valid (using the signature and expiration time)
- Obtain any payload data created with the token, such as userId, etc and make it available to us through `req.user` within Express.

1. Let's create a route that will allow POTUS to obtain the [gold codes](https://en.wikipedia.org/wiki/Gold_Codes), which allows them to authorize a nuclear attack. 

    ```js
    // controllers/api.js
    
    router.get('/gold_codes', (req, res) => {
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
    ``` 

    ![postman headers](./assets/gold_codes.png)

1. We definitely don't want to allow just anyone to access these codes! Let's lock this endpoint down. If you remember, Express is made up of a series of middleware calls. We can inject whatever middleware we want within a route. Let's take advantage of this and have `express-jwt` check for a valid JWT token with every request to this route. Insert the following into the parameters of your `router.get` method. 

    ```js
    jwtCheck({ secret: process.env.JWT_SECRET })
    ```

    Make sure your route looks like this now: 

    ```js
    router.get('/gold_codes', jwtCheck({ secret: process.env.JWT_SECRET }), (req, res) => {
      // ...
    });
    ```

1. If a user doesn't provide us with a valid token, they'll get an unauthorized error page. Let's make it more REST API friendly by changing the error to a JSON response. 

    In `app.js`, change the following: 

    ```js
    // app.js
    app.use((err, req, res, next) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
    ```

    To: 

    ```js
    // app.js
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
    ```

1. To access a protected resource, we'll need to include the JWT in the authorization header of the request. For instance, in Postman add the following header to the request: 

    ![postman headers](./assets/gold_codes_headers.png)

## Accessing Protected Endpoints with AJAX

What we have is great if we're only accessing our API through Postman only, but what if we need to access it through code in a client application? Let's see how we might do that with AJAX. 

1. In the `controllers/api.js` `/authorization` route, change the `res.json`:

    ```js
    res.json({
      user: claims,
      token: token
    });
    ```
    
    To this:

    ```js
    res.render('loggedin', {
      user: claims,
      token: token
    });    
    ```
    
2. Go into `public/js/main.js` and uncomment all the code.

3. We already know how to issue a regular POST request with form parameters, so we could simply use `$.ajax` to send `username`/`password` and get the token that way, but what then? We can at this point use [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to set and retrieve the auth token required to make some calls.

    _This code is provided in the `views/loggedin.ejs` file for reference._

    ```js
    // Saving the auth token
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiY3VzdG9tIjoiYW55IGN1c3RvbSBkYXRhIiwiaWF0IjoxNTA1ODUyMDM1fQ.hP5d-Qv89bLMeCxgl3keqmH_rScvCiqOdF59NQrZ-Pk');
    ``` 

    ```js
    // Retrieving the auth token for use in an AJAX call
    var token = localStorage.getItem('token');
    ```

4. Once we have the token, we can set the token in the AJAX headers before a request is made. 

    ```js
    $.ajax({
      url: 'http://localhost:3000/api/gold_codes',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    }).done(function(codes) {
      console.log('codes', codes);
    }).fail(function(err) {
      console.log('Error: ', err);
    });
    ```

## Resources

- https://jwt.io/
