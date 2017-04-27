import { combineReducers } from 'redux';

import auctionsReducer from './auctionsReducer.jsx';
import auctionReducer from './auctionReducer.jsx';
import artistReducer from './artistReducer.jsx';
import userReducer from './userReducer.jsx';
import bidReducer from './bidReducer';
import socketReducer from './socketReducer.jsx';
import notificationReducer from './notificationReducer.jsx';
import userAuctionsReducer from './userAuctionsReducer';
import profileReducer from './profileReducer';
import chatReducer from './chatReducer.jsx';
import artistsReducer from './artistsReducer';

const rootReducer = combineReducers({
  auctions: auctionsReducer,
  auction: auctionReducer,
  artist: artistReducer,
  artists: artistsReducer,
  user: userReducer,
  bid: bidReducer,
  socket: socketReducer,
  notifications: notificationReducer,
  userAuctions: userAuctionsReducer,
  profile: profileReducer,
  chat: chatReducer
});

export default rootReducer;
