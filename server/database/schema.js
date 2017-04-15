module.exports = function createSchemas(db) {
  return db.tx (t => {

    let drop = t.query('DROP TABLE IF EXISTS\
      followers, artwork_attributes, attributes, messages,\
      bids, auctions, artworks, users cascade \
    ');

    let users = t.query('CREATE TABLE IF NOT EXISTS users (\
      id SERIAL PRIMARY KEY NOT NULL,\
      password VARCHAR(300) NOT NULL,\
      username VARCHAR(30) NOT NULL UNIQUE,\
      email VARCHAR(30) NOT NULL UNIQUE,\
      first_name VARCHAR(30) NOT NULL,\
      last_name VARCHAR(30) NOT NULL,\
      type VARCHAR(30) NOT NULL DEFAULT user,\
      address VARCHAR(50)\
    )');
    let artworks = t.query('CREATE TABLE IF NOT EXISTS artworks (\
      id SERIAL PRIMARY KEY NOT NULL,\
      artist_id BIGINT NOT NULL REFERENCES users(id),\
      age VARCHAR(50) NOT NULL,\
      estimated_price BIGINT NOT NULL,\
      art_name VARCHAR(50) NOT NULL,\
      description TEXT,\
      dimensions TEXT,\
      image_url TEXT\
    )');
    let auctions = t.query('CREATE TABLE IF NOT EXISTS auctions (\
      id SERIAL PRIMARY KEY NOT NULL,\
      owner_id BIGINT NOT NULL REFERENCES users(id),\
      artwork_id BIGINT NOT NULL REFERENCES artworks(id),\
      start_date TIMESTAMP NOT NULL,\
      end_date TIMESTAMP NOT NULL,\
      start_price BIGINT NOT NULL,\
      buyout_price BIGINT NOT NULL,\
      current_bid BIGINT,\
      current_bid_id BIGINT,\
      bid_counter BIGINT DEFAULT 0\
    )');
    let bids = t.query('CREATE TABLE IF NOT EXISTS bids (\
      id SERIAL PRIMARY KEY NOT NULL,\
      bidder_id BIGINT NOT NULL REFERENCES users(id),\
      auction_id BIGINT NOT NULL REFERENCES auctions(id),\
      bid_date TIMESTAMP NOT NULL,\
      bid_price BIGINT NOT NULL\
    )');
    let attributes = t.query('CREATE TABLE IF NOT EXISTS attributes (\
      id SERIAL PRIMARY KEY NOT NULL,\
      attribute VARCHAR(50) NOT NULL\
    )');
    let messages = t.query('CREATE TABLE IF NOT EXISTS messages (\
      id SERIAL PRIMARY KEY NOT NULL,\
      text text NOT NULL,\
      sender_id BIGINT NOT NULL REFERENCES users(id),\
      receiver_id BIGINT NOT NULL REFERENCES users(id),\
      message_date TIMESTAMP NOT NULL\
    )');
    let artworkAttributes = t.query('CREATE TABLE IF NOT EXISTS artwork_attributes (\
      id SERIAL PRIMARY KEY NOT NULL,\
      attribute_id BIGINT NOT NULL REFERENCES attributes(id),\
      artwork_id BIGINT NOT NULL REFERENCES artworks(id)\
    )');
    let followers = t.query('CREATE TABLE IF NOT EXISTS followers (\
      id SERIAL PRIMARY KEY NOT NULL,\
      follower_id BIGINT NOT NULL REFERENCES users(id),\
      followee_id BIGINT NOT NULL REFERENCES users(id)\
    )');

    let closedAuctions = t.query('CREATE TABLE IF NOT EXISTS closed_auctions (\
      id SERIAL PRIMARY KEY NOT NULL,\
      auction_id BIGINT NOT NULL REFERENCES auctions(id),\
      winner BIGINT NOT NULL REFERENCES users(id),\
      payment_status status\
    )');

    return t.batch([drop, users, artworks, auctions, bids, attributes, messages, artworkAttributes, followers, closedAuctions]);
  })
  .then(() => {
    console.log('database tables created');
  })
  .catch((err) => {
    console.log('error creating tables', err);
  });
};
