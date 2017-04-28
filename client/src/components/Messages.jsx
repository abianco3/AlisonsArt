import React from 'react';
import { connect } from 'react-redux';
import { Message, Icon } from 'semantic-ui-react';

class Messages extends React.Component {
  render() {
    const { sendingBid, bidErrored, success, bid } = this.props;

    if (sendingBid) {
      return (
        <Message icon>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>Just a second!</Message.Header>
            Your bid is on the way.
          </Message.Content>
        </Message>
      );
    }

    if (bidErrored) {
      return (
        <Message
          header="Something Went Wrong!"
          content="There's been an error sending your bid. How about checking out some art and coming back in a minute?"
        />
      );
    }

    if (success) {
      return (
        <Message
          header={`You Bid $${bid}.00`}
          content="Congratulations. You're the highest bidder."
        />
      );
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.bid.error,
    hasErrored: state.bid.bidErrored,
    sendingBid: state.bid.sendingBid,
    success: state.bid.success,
    bid: state.bid.bid
  };
};

export default connect(mapStateToProps)(Messages);
