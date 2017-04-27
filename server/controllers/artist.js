const router = require('express').Router();
const model = require('../database/queries');
const authenticate = require('../middlewares/authenticate');

// to get all artists:
router.get('/', (req, res) => {
  const { limit } = req.params || 20;
  model.getArtists(limit)
  .then((artists) => {
    res.status(200).json(artists);
  })
  .catch(() => {
    res.status(500).json({status: 500, message: 'internal server error'});
  });
});

router.get('/:artistId', (req, res) => {
  let { artistId } = req.params;
  const queries = [model.getArtworksOfArtist(artistId), model.getAuctionsOfArtist(artistId), model.getArtistProfile(artistId)];
  Promise.all(queries)
  .then((fulfilled) => {
    const data = {};
    data.artworks = fulfilled[0];
    let timeNow = new Date().getTime();
    data.passedAuctions = fulfilled[1].filter(auction => auction.end_date.getTime() < timeNow);
    data.ongoingAuctions = fulfilled[1].filter(auction => auction.end_date.getTime() >= timeNow);
    data.profile = fulfilled[2];
    
    res.status(200).send(data);
  })
  .catch(err => {
    res.status(400).send('Get artist info error!');
  });
});

router.post('/profile', authenticate, (req, res) => {
  const profile = req.body;
  profile.user_id = req.user.userId;
  model.createArtistProfile(profile)
  .then(() => {
    res.status(201).send('success');
  })
  .catch((error) => {
    console.log(error);
    res.status(401).send('Invalid User Credentials');
  });
});

module.exports = router;
