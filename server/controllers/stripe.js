const router = require('express').Router();
const model = require('../database/queries');
const request = require('request');

router.get('/connect', (req, res) => {
  let connectURL = 'https://connect.stripe.com/oauth/authorize';

  const qs = {
    response_type: 'code',
    client_id: process.env.STRIPE_CLIENT_ID,
    scope: 'read_write'
  };

  let firstQ = true;

  for (var query in qs) {
    connectURL += firstQ ? `?${query}=${qs[query]}` : `&${query}=${qs[query]}`;
    firstQ = false;
  }

  res.redirect(connectURL);
});

router.get('/connect/callback', (req, res) => {
  const { code, error } = req.query;

  request.post('https://connect.stripe.com/oauth/token',
    { form: {
      grant_type: 'authorization_code',
      client_id: process.env.STRIPE_CLIENT_ID,
      code: code,
      client_secret: process.env.STRIPE_CLIENT_SECRET
    } },
    (error, response, body) => {
      const credentials = body;
      if (error) {
        res.send(error);
      }

      res.send(body);
    });
});

module.exports = router;
