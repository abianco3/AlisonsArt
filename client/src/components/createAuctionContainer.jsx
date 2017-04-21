import React from 'react';
import { connect } from 'react-redux';
import CreateAuction from './CreateAuction.jsx';

const CreateAuctionContainer = ({ artist, username, profile }) => {
  if (!username) {
    return (
      <h3>Please log-in before you create an auction</h3>
    );
  } else if (profile.hasErrored) {
    return (
      <h3>Something went wrong, please try again later</h3>
    );
  } else if (!artist) {
    return (
      <a href="/stripe/connect">Connect With Stripe</a>
    );
  } else {
    return (
      <CreateAuction />
    );
  }
};

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    artist: state.user.artist,
    profile: state.profile
  };
};

export default connect(mapStateToProps)(CreateAuctionContainer);