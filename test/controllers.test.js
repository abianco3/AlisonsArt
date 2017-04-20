process.env.NODE_ENV = "TESTING";
const supertest = require('supertest');
const app = require('../server/server.js');
const db = require('./../server/database/config.js');
const createSchema = require('./../server/database/schema.js');
const uploadData = require ('./../server/database/uploadSeedData.js')

describe('iii', () => {

  beforeAll(() => {
    return createSchema(db)
    .then(() => {
      return uploadData(db);
    });
  });

  test('it should be handled by the auctions controller', () => {
    return supertest(app)
    .get('/auctions')
    .expect(403)
    .end();
  });

  test('it should fail without a body', () => {
    return supertest(app)
    .post('/auctions', {})
    .expect(403)
    .end();
  });

  test('should be the highest bidder', () => {
    return supertest(app)
    .post('/auctions/11/bid', {bidPrice: 18000})
    .expect(201)
    .end((err, res) => {
      res.body.should.have.property('isHighestBidder', true);
    });
  });

  describe('stripe payment system', () => {
    test('should respond with 302 redirect when connecting', () => {
      return supertest(app)
      .get('/stripe/connect')
      .expect(302);
    });
  });

});
