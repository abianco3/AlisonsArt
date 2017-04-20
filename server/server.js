const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const busboy = require('express-busboy');

const recoverUserInfo = require('./middlewares/recoverUserInfo.js');
const auctionHandler = require('./controllers/auctions');
const homeHandler = require('./controllers/home');
const loginSignupHandler = require('./controllers/loginSignup');
const userHandler = require('./controllers/user');
const artistHandler = require('./controllers/artist');
const imageHandler = require('./controllers/imageUpload');
const notificationHandler = require('./controllers/notification');
const contactHandler = require('./controllers/contact');
const stripeHandler = require('./controllers/stripe');

const app = express();
busboy.extend(app, {
  upload: true,
});

const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  console.log('Listening on port ', port);
});
const io = require('./sockets.js').init(server);

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/../client/public')));

app.get('/*', recoverUserInfo);
app.use('/auctions', auctionHandler);
app.use('/home', homeHandler);
app.use('/auth', loginSignupHandler);
app.use('/user', userHandler);
app.use('/artist', artistHandler);
app.use('/images', imageHandler);
app.use('/notifications', notificationHandler);
app.use('/contactus', contactHandler);
app.use('/stripe', stripeHandler);

module.exports = server;
