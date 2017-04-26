const router = require('express').Router();
const model = require('../database/queries');
const Moment = require('moment');

const time = new Moment().format('YYYY-MM-DD HH:mm:ss');

router.get('/', (req, res) => {
  const queries = [model.getAuctions(6, time, '>'), model.getAuctions(6, time, '<'), model.featuredArt()];

  Promise.all(queries)
  .then(fufilled => {
    const data = {};
    data.current = fufilled[0];
    data.expired = fufilled[1];
    data.featuredArt = fufilled[2];
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(500).send(err);
  });
});

module.exports = router;
