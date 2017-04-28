const db = require('./config');
const helpers = db.$config.pgp.helpers;
const csAuctions = new helpers.ColumnSet(['auction_id', 'winner'], {table: 'closed_auctions'});
var csNotifications = new helpers.ColumnSet(['owner_id', 'trigger_id', 'type', 'text', 'date'], {table: 'notifications'});

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

  getArtists(limit) {
    return db.manyOrNone('SELECT profiles.image_url, profiles.profile, profiles.fb_link, profiles.twitter_link, profiles.inst_link, users.first_name, users.last_name, users.id FROM profiles INNER JOIN users ON profiles.user_id=users.id LIMIT $1', [limit]);
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
  getUserSavedAuctions(userId) {
    return db.manyOrNone('SELECT * FROM ((SELECT auctions.artwork_id, auctions.end_date, auctions.id AS auction_id FROM auctions INNER JOIN saves ON auctions.id=saves.auction_id AND saves.user_id=$1) AS table1 INNER JOIN artworks ON table1.artwork_id= artworks.id)', 
        [userId]);
  }
  ,
  getAuctionBids(auctionId) {
    return db.query('select * from bids where auction_id=$1', [auctionId]);
  },
  getAuctionBidsDistinct(auctionId) {
    
    return db.query('select distinct on (bidder_id) bidder_id, auction_id, MAX(bid_price) as bid_price, art_name\
    from bids left join auctions on auctions.id = bids.auction_id\
    left join artworks on auctions.artwork_id = artworks.id where auction_id = $1 group by bidder_id, auction_id, art_name', [auctionId]);
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

  getUserMessages(userId, receiverId) {
    return db.query('SELECT users.first_name, users.last_name, messages.text, messages.sender_id, messages.receiver_id, messages.message_date FROM messages INNER JOIN users ON users.id=$2 WHERE messages.sender_id=$1 AND messages.receiver_id=$2 OR messages.sender_id=$2 AND messages.receiver_id=$1', [userId, receiverId]);
  },

  getInboxMessages(userId, username) {
    return db.query("SELECT users.first_name, users.last_name, messages.text, messages.sender_id, messages.receiver_id, messages.message_date FROM messages INNER JOIN users ON messages.sender_id=users.id AND users.username!=$2 OR messages.receiver_id=users.id AND users.username!=$2 WHERE messages.sender_id=$1 OR messages.receiver_id=$1 ORDER BY messages.id DESC", [userId, username]);
  },

  workerAuctions(prevJob, endDate) {

    // return db.query('select w.auction_id, w.current_bid_id as winner_id from\
    // (select id as auction_id, current_bid_id, end_date from auctions\
    // where end_date <= $1 and end_date > $2\
    // and current_bid_id IS NULL UNION\
    // (select auctions.id as auction_id, bids.bidder_id, auctions.end_date from auctions\
    // INNER JOIN bids ON auctions.current_bid_id=bids.id\
    // where auctions.end_date <= $1 and auctions.end_date > $2)) as w ORDER by w.end_date', [endDate, prevJob]);
    return db.query('select auctions.id as auction_id, bids.bidder_id as winner from auctions left outer join bids\
    on current_bid_id = bids.id where auctions.end_date <= $1 and auctions.end_date > $2\
    except (select auction_id, winner from closed_auctions)', [endDate, prevJob]);

    // return db.query('select auctions.id as auction_id, bids.bidder_id as winner from auctions left outer join bids\
    // on current_bid_id = bids.id where auctions.end_date <= $1 and auctions.end_date > $2\
    // order by auctions.end_date', [endDate, prevJob]);
  },
  getUserAuctions(userId) {
    return db.query('select id from (select id from auctions as auction_id\
    where owner_id = $1 UNION all select auction_id from bids where bidder_id = $1\
    ) as foo group by id', [userId])
  },
  workerInsertClosed(array) {
    return db.none(helpers.insert(array, csAuctions));
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
  getUserFollows(userId) {
    return db.query('SELECT * FROM \
      (SELECT followee_id FROM followers WHERE follower_id=$1) AS table1 \
      INNER JOIN(SELECT artworks.image_url, users.first_name, users.last_name, users.id FROM artworks \
      INNER JOIN users ON artworks.artist_id=users.id) AS table2 \
      ON table1.followee_id=table2.id LIMIT 1', [userId]);
  },
  getFollowOrNot(userId, artistId) {
    return db.oneOrNone('SELECT * FROM followers WHERE follower_id=$1 AND followee_id=$2', [userId, artistId]);
  },
  getArtworks() {
    return db.query('select * from artworks');
  },
  getArtworksOfArtist(artist_id) {
    return db.query('SELECT artworks.image_url FROM artworks INNER JOIN users ON artworks.artist_id=users.id AND artworks.artist_id=$1', [artist_id]);
  },
  getAuctionsOfArtist(artist_id) {
    return db.any('SELECT auctions.id AS auction_id, auctions.artwork_id, auctions.end_date, auctions.current_bid, Table1.image_url, Table1.art_name, Table1.estimated_price \
      FROM auctions INNER JOIN \
      (SELECT artworks.* FROM artworks INNER JOIN users ON (users.id=artworks.artist_id AND users.id=$1)) AS Table1 \
      ON auctions.artwork_id=Table1.id', [artist_id]);
  },

  createArtistProfile(profile) {
    return db.none('INSERT INTO profiles (user_id, profile, fb_link, twitter_link, inst_link) \
    VALUES (${user_id}, ${profile}, ${fb_link}, ${twitter_link}, ${inst_link})', profile);
  },

  updateStripe(stripeCreds, userId) {
    return db.one('UPDATE profiles SET stripe_user_id = $1, refresh_token=$2 \
      WHERE user_id=$3 returning stripe_user_id', [stripeCreds.stripe_user_id, stripeCreds.refresh_token, userId]);
  },

  getStripeId(userId) {
    return db.one('SELECT stripe_user_id FROM profiles WHERE user_id=$1', [userId]);
  },

  getArtistProfile(artist_id) {
    return db.oneOrNone('SELECT profiles.image_url, profiles.profile, profiles.fb_link, profiles.twitter_link, profiles.inst_link, users.first_name, users.last_name FROM profiles INNER JOIN users ON profiles.user_id=users.id AND user_id=$1', [artist_id]);
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
      returning id, type', userObj);
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
      (owner_id, trigger_id, type, date, text)\
      values \
      (${owner_id}, ${trigger_id}, ${type}, ${date}, ${text})\
      returning *', notificationObj);
  },
  createMassNotifications(arrayOfNotifications) {
    return db.query(helpers.insert(arrayOfNotifications, csNotifications));
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
  deleteFollower(userId, artistId) {
    return db.none('DELETE FROM followers WHERE follower_id=$1 AND followee_id=$2', [userId, artistId]);
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

  updateUserType(type, id) {
    return db.none('UPDATE users SET type=$1 where id=$2', [type, id]);
  },
  
  saveAuction(user_id, auction_id) {
    let auctionId = Number(auction_id);
    return db.oneOrNone('SELECT * FROM saves WHERE user_id=$1 AND auction_id=$2', [user_id, auctionId])
    .then(data => {
      if(data && Object.keys(data).length > 0) {
        return 'existing save';
      }
      return db.none(`INSERT INTO saves \
        (user_id, auction_id) \
        values \
        (${user_id}, ${auctionId})`
      );
    });
  },
  unsaveAuction(userId, auctionId) {
    return db.none('DELETE FROM saves WHERE user_id=$1 AND auction_id=$2', [userId, auctionId]);
  },
  getSaveOrNot(userId, auctionId){
    return db.oneOrNone('SELECT * FROM saves WHERE user_id=$1 AND auction_id=$2', [userId, auctionId]);
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
    console.log(auctionObj, 'objbjbjb')
    return db.task((t) => {
      return t.one('SELECT current_bid_id FROM auctions where id=$1', [auctionObj.auction_id])
      .then((result) => {
        if (result.current_bid_id === null) {
          if (parseInt(auctionObj.bid.bid_price) === parseInt(auctionObj.buyout_price)) {
            return t.one('update auctions SET current_bid_id = $1, \
              bid_counter = bid_counter + 1, current_bid = $3, end_date = $4\
              where id = $2 returning current_bid_id, current_bid', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price, auctionObj.time]);
          } else {
            return t.one('update auctions SET current_bid_id = $1, \
              bid_counter = bid_counter + 1, current_bid = $3\
              where id = $2 returning current_bid_id, current_bid', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price]);
          }
        } else {
          return t.one('SELECT bids.bid_price, bids.bidder_id, bids.id FROM bids INNER JOIN auctions ON \
            auctions.id=$1 AND bids.id=auctions.current_bid_id', [auctionObj.auction_id])
          .then((currentBid) => {
            // if the new bid is higher than the current champion
            console.log('reached this', parseInt(auctionObj.bid.bid_price) === parseInt(auctionObj.buyout_price));
            if (parseInt(currentBid.bid_price) < parseInt(auctionObj.bid.bid_price)) {
              // set it to be the current_bid_id
              if (parseInt(auctionObj.bid.bid_price) === parseInt(auctionObj.buyout_price)) {
                console.log('reached this equality', auctionObj.time);
                return t.one('update auctions SET current_bid_id = $1, \
                  bid_counter = bid_counter + 1, current_bid = $3, end_date = $4\
                  where id = $2 returning current_bid, current_bid_id, owner_id, end_date', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price, auctionObj.time])
                  .then((bid) => {
                    console.log('biddssssssss', bid);
                    bid.bidder_id = currentBid.bidder_id
                    return bid;
                  });
              } else {
                return t.one('update auctions SET current_bid_id = $1, \
                  bid_counter = bid_counter + 1, current_bid = $3\
                  where id = $2 returning current_bid, current_bid_id, owner_id', [auctionObj.bid.id, auctionObj.auction_id, auctionObj.bid.bid_price])
                  .then((bid) => {
                    bid.bidder_id = currentBid.bidder_id
                    return bid;
                  });
              }
            } else {
              return currentBid;
            }
          });
        }
      });
    });
  },
  closeAuction(auctionId, time) {
    return db.query('UPDATE auctions set end_date=$1 where auction_id=$2', [time, auctionId]);
  },
  updatePaymentStatus(status, auctionId) {
    return db.query('UPDATE closed_auctions SET payment_status=$1 WHERE auction_id=$2', [status, auctionId]);
  }
};
