const db = require('./config');

module.exports = {
  getUser(userId) {
    return db.query('select * from users where id=$1', [userId]);
  },
  getUserByName(username) {
    return db.query('select * from users where username=$1', [username]);
  },
  getUserByEmail(email) {
    return db.query('select * from users where email=$1', [email]);
  },
  getUsers() {
    return db.query('select * from users');
  },
  getUserOwnedAuctions(userId) {
    return db.query('select * from auctions where owner_id=$1', [userId]);
  },
  getUserBiddingAuctions(userId) {
    return db.tx((t) => {
      // map each auction
      const auctionQ = 'SELECT DISTINCT auctions.*, artworks.art_name, artworks.image_url, artworks.age, artworks.description, artworks.dimensions, \
      users.first_name, users.last_name FROM auctions INNER JOIN\
      bids ON auctions.id = bids.auction_id AND bids.bidder_id = $1 INNER JOIN\
      artworks ON artworks.id = auctions.artwork_id INNER JOIN users\
      ON users.id = auctions.owner_id';
      return t.map(auctionQ, [userId], (auction) => {
        // check if it is closed
        return t.one('SELECT * from closed_auctions where auction_id=$1', [auction.id])
        .then((closed) => {
          auction.closed = true;
          if (closed.winner === userId.toString()) {
            auction.won = true;
            auction.payment_status = closed.payment_status;
          } else {
            auction.won = false;
          }

          return auction;
        })
        // see if the user is the highest bidder
        .catch(() => {
          auction.closed = false;
          return t.one('SELECT bidder_id FROM bids where id = $1', [auction.current_bid_id])
          .then((bid) => {
            auction.isHighestBidder = bid.id === userId.toString();
            return auction;
          });
        });
      })
      .then(t.batch);
    });
  },
  getUserBids(userId) {
    return db.query('select * from bids where bidder_id=$1', [userId]);
  },
  getAuctionBids(auctionId) {
    return db.query('select * from bids where auction_id=$1', [auctionId]);
  },
  getUserBidsPerAuction({ user_id, auction_id, limit }) {
    /*
    {
      user_id:
      auction_id:
    }
    select * from bids where bidder_id=1 and auction_id=1
    */
    return db.query('select * from bids where bidder_id=$1 and auction_id=$2 LIMIT $3^', [user_id, auction_id, limit]);
  },

  getUserMaxBidPerAuction({ user_id, auction_id }) {
    /*
    {
      user_id:
      auction_id:
    }
    select * from bids where bidder_id=1 and auction_id=1
    */
    return db.one('select * from bids where bidder_id=$1 and auction_id=$2 ORDER BY bid_price DESC LIMIT 1', [user_id, auction_id]);
  },

  getUserMessages(userId) {
    return db.query('select * from messages where sender_id=$1 or receiver_id=$1', [userId]);
  },

  getAuctions(limit, endDate, status) {
    let query;
    if (status === '<') {
      query = 'select auctions.*, users.first_name, users.last_name FROM auctions INNER JOIN users ON \
      auctions.owner_id=users.id AND auctions.end_date < $2 ORDER BY auctions.end_date ASC LIMIT $1';
    } else {
      query = 'select auctions.*, users.first_name, users.last_name FROM auctions INNER JOIN users ON \
      auctions.owner_id=users.id AND auctions.end_date > $2 ORDER BY auctions.end_date ASC LIMIT $1';
    }
    return db.task((t) => {
      return t.map(query, [limit, endDate], (auction) => {
        const query = 'select * from artworks where id=$1';
        return t.one(query, [auction.artwork_id])
        .then((artwork) => {
          auction.artwork = artwork;
          return auction;
        })
        .then((auction) => {
          const query = 'SELECT bid_price FROM bids where id=$1';
          if (auction.current_bid_id === null) {
            auction.current_bid = auction.start_price;
            return auction;
          }

          return t.one(query, [auction.current_bid_id])
          .then((bid) => {
            auction.current_bid = bid.bid_price;
            return auction;
          });
        });
      })
      .then(t.batch);
    });
  },
  getUserNotifications(userId) {
    return db.query('select * from notifications where owner_id =$1 ORDER BY date DESC', [userId]);
  },

  featuredArt() {
    const query = 'SELECT DISTINCT ON (artworks.artist_id) artworks.artist_id, artworks.id, artworks.image_url, \
    artworks.age, artworks.art_name, artworks.estimated_price, artworks.description, artworks.dimensions, \
    users.first_name, users.last_name from artworks INNER JOIN \
    users ON artworks.artist_id=users.id LIMIT 3';
    
    return db.query(query);
  },

  getAuction(auctionId) {
    const query = 'select auctions.*, users.first_name, users.last_name FROM auctions \
    INNER JOIN users ON auctions.owner_id=users.id AND auctions.id=$1';
    return db.task((t) => {
      return t.map(query, [auctionId], (auction) => {
        const query = 'select * from artworks where id=$1';
        return t.one(query, [auction.artwork_id])
        .then((artwork) => {
          auction.artwork = artwork;
          return auction;
        });
      })
      .then(t.batch);
    });
  },
  getUserFollowers(userId) {
    return db.query('select * from users inner join followers\
     on users.id = followers.follower_id where followers.followee_id = $1', [userId]);
  },
  getUserFollows(userId) {
    return db.query('select * from users inner join followers\
     on users.id = followers.follower_id where followers.follower_id = $1', [userId]);
  },
  getArtworks() {
    return db.query('select * from artworks');
  },
  getArtworksOfArtist(artist_id) {
    return db.query('SELECT artworks.image_url FROM artworks INNER JOIN users ON artworks.artist_id=users.id AND artworks.artist_id=$1', [artist_id]);
  },
  getAuctionsOfArtist(artist_id) {
    return db.any('SELECT auctions.id as auction_id, auctions.artwork_id, auctions.end_date, auctions.current_bid, Table1.image_url, Table1.art_name, Table1.estimated_price FROM auctions INNER JOIN (SELECT artworks.* FROM artworks INNER JOIN users ON (users.id=artworks.artist_id AND users.id=$1)) as Table1 ON auctions.artwork_id=Table1.id', [artist_id]);
  },

  createArtistProfile(artist_id, profile) {
    return db.none('INSERT INTO profiles (user_id, profile, fb_link, twitter_link, inst_link) \
    VALUES (${user_id}, ${profile}, ${fb_link}, ${twitter}, ${inst_link})', profile);
  },

  getArtistProfile(artist_id) {
    return db.oneOrNone('SELECT profiles.profile, profiles.fb_link, profiles.twitter_link, profiles.inst_link, users.username FROM profiles INNER JOIN users ON profiles.user_id=users.id AND user_id=$1', [artist_id]);
  },
  getUserArtworks(userId) {
    return db.query('select * from artworks where artist_id = $1', [userId]);
  },

  createUser(userObj) {

    /*
    {
      password:
      username:
      first_name:
      last_name:
      address:
      email:
      type:
    }
    insert into users (username, first_name, last_name, email, address, type, password) values ('wdku', 'winston', 'ku', 'wdku5791@gmail.com', '471 quail drive', 'user', 'hashed')
    */
    return db.query('insert into users \
      (username, first_name, last_name, email, address, type, password)\
      values \
      (${username}, ${first_name}, ${last_name}, ${email}, ${address}, ${type}, ${password})\
      returning id', userObj);
  },
  createAuction(auctionObj) {
    /*
    {
      owner_id:
      artwork_id:
      start_date:
      end_date:
      start_price:
      buyout_price:
      current_bid_id:
      bid_counter:
    }
    insert into auctions (owner_id, artwork_id, start_date, end_date, start_price, buyout_price, bid_counter) values ('1', '1', '2017-01-07 04:05:06 -8:00', '2017-01-08 09:05:06 -8:00', '100', '500', '0')
    */


    return db.one('insert into auctions \
      (owner_id, artwork_id, start_date, end_date, start_price, buyout_price)\
      values \
      (${owner_id}, ${artwork_id}, ${start_date}, ${end_date}, ${start_price}, ${buyout_price})\
      returning id', auctionObj);
  },
  createNotification(notificationObj) {
  /*{
      id 
      owner_id
      trigger_id
      type
      read
      date
      text
    } */
    return db.one('insert into notifications \
      (owner_id, trigger_id, type, read, date, text)\
      values \
      (${owner_id}, ${trigger_id}, ${type}, ${read}, ${date}, ${text})\
      returning id', notificationObj);
  },
  createArtwork(artworkObj) {
    /*
    {
      artist_id:
      age:
      estimated_price:
      art_name:
      description:
      dimensions:
      image_url:
    }
    insert into artworks (artist_id, age, estimated_price, art_name, description, dimensions, image_url) values ('1', '520', '200', 'Alisons Masterpiece', 'Emaculately crafted by a master sculptor', '10 x 20 x 15', 'image_urlsuperlongstring')
    */
    return db.one('insert into artworks \
      (artist_id, age, estimated_price, art_name, description, dimensions, image_url)\
      values \
      (${artist_id}, ${age}, ${estimated_price}, ${art_name}, ${description}, ${dimensions}, ${image_url})\
      returning id', artworkObj);
  },
  createAuctionWithArtwork(auctionObj) {
    return createArtwork(auctionObj.artwork)
    .then((result) => {
      auctionObj.auction_id = result[0].id;
      return createAuction(auctionObj);
    })
  },
  createBid(bidObj) {
    /*
    {
      bidder_id:
      auction_id:
      bid_date:
      bid_price:
    }
    insert into bids (bidder_id, auction_id, bid_date, bid_price) values ('1', '1', '2017-01-08 04:05:06 -8:00', '250')
    */
    return db.one('insert into bids \
      (bidder_id, auction_id, bid_date, bid_price)\
      values \
      (${bidder_id}, ${auction_id}, ${bid_date}, ${bid_price})\
      returning *', bidObj);
  },
  createFollower(followerObj) {
    /*
    {
      follower_id:
      followee_id:
    }
    insert into followers (follower_id, followee_id) values ('1', '1')
    */
    return db.query('insert into followers \
      (follower_id, followee_id)\
      values \
      (${follower_id}, ${followee_id})\
      returning id', followerObj);
  },
  createMessage(messageObj) {
    /*
    {
      text:
      sender_id:
      reciever_id:
      message_date:
    }
    insert into messages (text, sender_id, receiver_id, message_date) values ('woohoo lots of fun', '1', 1, '2017-01-08 04:05:06 -8:00')
    */
    return db.query('insert into messages \
      (text, sender_id, receiver_id, message_date)\
      values \
      (${text}, ${sender_id}, ${receiver_id}, ${message_date})\
      returning id', messageObj);
  },

  changeUserPassword(userId, password) {
    return db.oneOrNone('UPDATE users SET password=$1 WHERE id=$2', [password, userId]);
  },

  updateUser() {
    //TODO
  },
  updateUserNotification({id, owner_id}) {
  /*{
      id 
      owner_id
      trigger_id
      type
      read
      date
      text
    } */
    return db.one('UPDATE notifications SET read=true where id=$1 and owner_id=$2 returning read', [id, owner_id]);
  },
  updateAuction(auctionObj) {
    /*
    {
      auction_id:
      bid_id:
    }
    */
    return db.task((t) => {
      return t.one('SELECT current_bid_id FROM auctions where id=$1', [auctionObj.auction_id])
      .then((result) => {
        if (result.current_bid_id === null) {
          return t.one('update auctions SET current_bid_id = $1, \
            bid_counter = bid_counter + 1, current_bid = $3\
            where id = $2 returning current_bid_id, current_bid', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price]);
        } else {
          return t.one('SELECT bids.bid_price, bids.id FROM bids INNER JOIN auctions ON \
            auctions.id=$1 AND bids.id=auctions.current_bid_id', [auctionObj.auction_id])
          .then((currentBid) => {
            // if the new bid is higher than the current champion
            if (parseInt(currentBid.bid_price) < parseInt(auctionObj.bid.bid_price)) {
              // set it to be the current_bid_id
              return t.one('update auctions SET current_bid_id = $1, \
                bid_counter = bid_counter + 1, current_bid = $3\
                where id = $2 returning current_bid, current_bid_id', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price]);
            } else {
              return currentBid;
            }
          });
        }
      });
    });
  }


};