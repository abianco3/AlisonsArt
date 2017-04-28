const dotenv = require('dotenv').config();
const cron = require('node-cron');
const model = require('./database/queries');
const Moment = require('moment');

let time;
let prevJobTime = new Moment().subtract(5, 'years').format('YYYY-MM-DD HH:mm:ss');
cron.schedule('*/30 * * * * *', function() {
  time = new Moment().format('YYYY-MM-DD HH:mm:ss');
  // retrieve all auctions from the auctions table between previous cron job and now.
  model.workerAuctions(prevJobTime, time)
  .then((results) => {
    var notifications = [];
    var textNoty;
    // console.log('every 10 seconds', results, time, prevJobTime);
    // if there are new auctions, insert them into the closed auctions table.
    if (results.length > 0) {
      // tell server sockets the auctions have closed. (sends a list of auctions);
      process.send({data: results, type: 'closed'});
      // inserted into closed auctions table with winner id;
      const insertClosed = model.workerInsertClosed(results).then(() => {console.log('inserted into closed_auctions table')});
      // for each auction get all the bidders unique (each bidder shows up once);
      return Promise.all((results.map((auction, index) => {
        
        return model.getAuctionBidsDistinct(auction.auction_id)
        .then((bidResults) => {
          
          if (bidResults.length > 0) {
            bidResults.forEach((bid) => {
              // for each bidder check if the bidder is the winner

              if (bid.bidder_id === auction.winner) {
                // if winner send them a winning auction notification
                textNoty = `Congratulations you have won an auction ${bid.art_name} for ${bid.bid_price}`;
              } else {
                // if not winner send them an auction you have bid upon ended notification
                textNoty = `An auction you have bidded upon ${bid.art_name} has ended`;
              }
                notifications.push({
                  owner_id: bid.bidder_id,
                  trigger_id: auction.auction_id,
                  type: 'auction',
                  date: time,
                  text: textNoty
                });
            });
          }
        })
      })
      ).concat(insertClosed))
      .then(() => {
        // write the array of notifications;
        process.send({data: notifications, type: 'notification'});
        return model.createMassNotifications(notifications);
      });
    }
  })
  .then((result) => {
    console.log('completed worker requests');

  }) 
  .catch((error) => {
    console.log('error in cron', error);
    process.send({data: error, type: 'error'});
  });
  prevJobTime = time;
});

module.exports = cron;
