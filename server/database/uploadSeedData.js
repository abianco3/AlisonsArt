const db = require('./config.js');
const data = require('./dummyData.js');
const users = data.users;
const artworks = data.artworks;
const auctions = data.auctions;
const closedAuctions = data.closedAuctions;
const bids = data.bids;

var helpers = db.$config.pgp.helpers;

var csUsers = new helpers.ColumnSet(['username', 'first_name', 'last_name', 'email', 'address', 'type', 'password'], {table: 'users'});
var csArtWorks = new helpers.ColumnSet(['artist_id', 'age', 'estimated_price', 'art_name', 'description', 'dimensions', 'image_url'], {table: 'artworks'});

module.exports = function insertDummyData(db) {
   return db.tx((t) => {

        var userInserts = t.none(helpers.insert(users, csUsers));
        var artWorkInserts = t.none(helpers.insert(artworks, csArtWorks));

        var auctionInserts = auctions.map(auction => t.none('INSERT INTO auctions \
                (owner_id, artwork_id, start_date, end_date, start_price, buyout_price, current_bid_id, current_bid, bid_counter)\
                VALUES \
                ((SELECT id FROM users WHERE id = ${owner_id}), (SELECT id FROM artworks WHERE id = ${artwork_id}), ${start_date}, ${end_date}, ${start_price}, ${buyout_price}, ${current_bid_id}, ${current_bid}, ${bid_counter})', auction));

        var bidInserts = bids.map(bid => t.none('INSERT INTO bids \
                (bidder_id, auction_id, bid_date, bid_price)\
                VALUES \
                ((SELECT id FROM users WHERE id = ${bidder_id}), (SELECT id FROM auctions WHERE id = ${auction_id}), ${bid_date}, ${bid_price})', bid));
        var closedAuctionsInserts = closedAuctions.map(closedAuction => t.none('INSERT INTO closed_auctions \
                (auction_id, winner, payment_status)\
                VALUES \
                ((SELECT id FROM auctions WHERE id = ${auction_id}), (SELECT id FROM users WHERE id = ${winner}), ${payment_status})', closedAuction));
        return t.batch([].concat(userInserts, artWorkInserts, auctionInserts, bidInserts, closedAuctionsInserts));
    })
        .then(() => {
            console.log('success seeding data');
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
};
