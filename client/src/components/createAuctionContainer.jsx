import React from 'react';
import { connect } from 'react-redux';
import CreateAuction from './CreateAuction.jsx';
import Connect from './connect.jsx';

const CreateAuctionContainer = ({ artist, username, profile, history }) => {
  if (!username) {
    return (
      <h3>Please log-in before you create an auction</h3>
    );
  } else if (!artist) {
    return (
      <Connect history={history}/>
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