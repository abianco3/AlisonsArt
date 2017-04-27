const router = require('express').Router();
const model = require('../database/queries');
const Moment = require('moment');
const authenticate = require('../middlewares/authenticate.js');

const serverErr = { ERR: { status: 500, message: 'Something went wrong. So Sorry!' } };

module.exports = function(io) {
  router.get('/', (req, res) => {
    const limit = req.query.limit || 20;
    const status = req.query.status || '>';
    const time = new Moment().format('YYYY-MM-DD HH:mm:ss');
    model.getAuctions(limit, time, status)
    .then((auctions) => {
      res.status(200).json(auctions);
    })
    .catch((err) => {
      res.status(500).send(serverErr);
    });
  });

  router.post('/', authenticate, (req, res) => {
    model.createArtwork(req.body.artwork)
    .then((data) => {
      req.body.artwork_id = data.id;
      return model.createAuction(req.body)
      .then((auctionId) => {
        res.status(201).json(auctionId);
      });
    })
    .catch((serverErr) => {
      res.status(500).send(serverErr);
    });
  });

  router.get('/ongoing', authenticate, (req, res) => {
    const user = req.user.userId;
    model.getUserBiddingAuctions(user)
    .then((auctions) => {
      res.status(200).json(auctions);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
  });

  router.get('/:auctionId', (req, res) => {
    model.getAuction(req.params.auctionId)
    .then((auctions) => {
      if (auctions.length === 0) {
        res.status(404).json({ ERR: { Status: 404, message: 'this auction does not exist' } });
      }
      res.status(200).json(auctions);
    })
    .catch(() => {
      res.status(500).send(serverErr);
    });
  });

  router.get('/:auctionId/bids', (req, res) => {
    model.getAuctionBids(req.params.auctionId)
    .then((bids) => {
      res.status(200).json(bids);
    })
    .catch((err) => {
      res.status(500).json(serverErr);
    });
  });

  router.post('/:auctionId/bids', authenticate, (req, res) => {
    const bid = {};
    bid.auction_id = req.params.auctionId;
    bid.bidder_id = req.user.userId;
    bid.bid_price = req.body.bidPrice;
    bid.bid_date = new Moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log(io.sockets.sockets, 'listof sockets in auctions handler');
    model.getAuction(bid.auction_id)
    .then((auctionResult) => {

      if (!(auctionResult.current_bid === auctionResult.buyout_price)) {
        model.createBid(bid)
        .then((bid) => {
          const update = {};
          update.auction_id = req.params.auctionId;
          update.bid = bid;
          let time = new Moment().format('YYYY-MM-DD HH:mm:ss');
          return model.updateAuction(update, time)
          .then((bid) => {
            // new bid beats current highest bid
            // console.log(bid, bid.owner_id, 'LOOK HERE');
            if (bid.owner_id) {
              // person is currently on.
              return model.getAuction(update.auction_id)
              .then((auction) => {
                
                const noty = [{
                        owner_id: bid.bidder_id,
                        trigger_id: auction[0].id,
                        type: 'outbid',
                        date: new Moment().format('YYYY-MM-DD HH:mm:ss'),
                        text: `You have been outbid on an auction ${auction[0].artwork.art_name}`
                },{
                        owner_id: bid.owner_id,
                        trigger_id: auction[0].id,
                        type: 'auction',
                        date: new Moment().format('YYYY-MM-DD HH:mm:ss'),
                        text: `Someone has bid on your auction ${auction[0].artwork.art_name}`
                }];
                return model.createMassNotifications(noty)
                .then(() => {
                  // console.log(io.socketList, 'list socket emissions')
                  // console.log('owner, bidder', io.socketList.hasOwnProperty(bid.owner_id), io.socketList.hasOwnProperty(bid.bidder_id));
                  if (io.socketList.hasOwnProperty(bid.owner_id)) {
                    io.socketList[bid.owner_id].emit('action', {type: 'UPDATE_NEW_NOTIFICATIONS', data: [noty[1]]});
                  }
                  if (io.socketList.hasOwnProperty(bid.bidder_id)) {
                    io.socketList[bid.bidder_id].emit('action', {type: 'UPDATE_NEW_NOTIFICATIONS', data: [noty[0]]});
                  }
                  // console.log('room:'+req.params.auctionId);
                  io.emit('action', {type: 'UPDATE_CURRENT_BID', current_bid: bid.bid_price || bid.current_bid, current_bid_id: bid.id || bid.current_bid_id});
                  res.status(201).json({
                    current_bid: bid.bid_price || bid.current_bid,
                    current_bid_id: bid.id || bid.current_bid_id 
                  });  
                });
              });
            } else {
              io.emit('action', {type: 'UPDATE_CURRENT_BID', current_bid: bid.bid_price || bid.current_bid, current_bid_id: bid.id || bid.current_bid_id});
              res.status(201).json({
                current_bid: bid.bid_price || bid.current_bid,
                current_bid_id: bid.id || bid.current_bid_id 
              });
            }
          });
        })
        .catch((err) => {
          res.status(500).json(serverErr);
        });
      } else {
        res.status(400).json('auction ended')
      }
    });
  });

  router.get('/:auctionId', (req, res) => {
    model.getAuction(req.params.auctionId)
    .then((auctions) => {
      if (auctions.length === 0) {
        res.status(404).json({ ERR: { Status: 404, message: 'this auction does not exist' } });
      }
      res.status(200).json(auctions);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
  });

  return router;
};
