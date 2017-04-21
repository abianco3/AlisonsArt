const router = require('express').Router();
const model = require('../database/queries');
const Moment = require('moment');
const jwt = require('jsonwebtoken');

const serverErr = { ERR: { status: 500, message: 'Something went wrong. So Sorry!' } };

router.post('/login', (req, res) => {
  let { username, password } = req.body;
  //check if user exists
  model.getUserByName(username)
  .then(response => {
    //user does NOT exist
    if(response.length === 0) {
      throw Error('user does not exist!');
    } else {
    //check if password matches the ones in database, consider HASH
      if (response[0].password === password) {
        //succeed! we can assign a token here!
        let authToken = jwt.sign({
          username: username,
          userId: response[0].id,
          type: response[0].type,
          isAuthenticated: true,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, process.env.jwtSecret);
        
        res.setHeader('x-username', username);
        res.setHeader('x-userId', response[0].id);
        res.setHeader('x-type', response[0].type);
        res.status(201).send(JSON.stringify(authToken));
      } else {
        throw Error('Wrong password');
      }
    }
  })
  .catch(err => {
    res.status(400).send('Wrong username or password!');
  });
});

router.post('/signup', (req, res) => {
  let { username, password, firstName, lastName, email, address } = req.body;
  //check if user exists 
  Promise.all([model.getUserByName(username), model.getUserByEmail(email)])
  .then(response => {
    //username taken or email taken.
    if(response.length === 1) {
      throw Error('username or email already exists!');
    } else {
      // const query = {
      //   password: password
      //   username: username
      //   first_name: firstName
      //   last_name: lastName
      //   address:
      //   email:
      //   type:
      // };
      return model.createUser(req.body);
    }
  })
  .then((result) => {
    let authToken = jwt.sign({
          username: username,
          userId: result[0].id,
          type: result[0].type,
          isAuthenticated: true,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, process.env.jwtSecret);

    res.setHeader('x-username', username);
    res.setHeader('x-userId', result[0].id);
    res.setHeader('x-type', result[0].type);
    res.status(201).send(JSON.stringify(authToken));
  })
  .catch(err => {
    if (err.code === '23505') {
      const message = 'username or email already exists';
      res.status(400).send(message);
    } else {
      res.status(500).send(err);
    }
  });
});

module.exports = router;

