import React, { Component } from 'react';
import { Container, Grid, Message, Icon, Button } from 'semantic-ui-react';
import * as userAuctions from '../../actions/userAuctionsActionCreator';
import ClosedAuction from './ClosedAuction.jsx';
import OpenAuction from './OpenAuction.jsx';
import { connect } from 'react-redux';

class UserAuctions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false
    };
  }

  componentWillMount() {
    const { dispatch, user } = this.props;

    dispatch(userAuctions.fetchingUserAuctions(true));
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('authorization', `Bearer ${sessionStorage.getItem('authToken')}`);
    fetch('/auctions/ongoing', {
      headers: headers
    })
    .then(response => {
      if (!response.ok) {
        const error = new Error(response.statusText);
        error.status = response.status;
        throw error;
      }
      dispatch(userAuctions.fetchingUserAuctions(false));
      return response.json();
    })
    .then(data => {
      dispatch(userAuctions.userAuctionsFetched(data));
    })
    .catch((err) => dispatch(userAuctions.userAuctionsErrored(err)));
  }

  showErrorToggle() {
    this.setState({
      showError: !this.state.showError
    });
  }

  goToAuctions() {
    this.props.history.push('/auctions');
  }

  render() {
    let { openAuctions, closedAuctions, isFetching, hasErrored } = this.props.userAuctions;
    const { history } = this.props;

    if (isFetching) {
      return (
        <Message icon>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>Just a second!</Message.Header>
            Your Auctions are on the way.
          </Message.Content>
        </Message>
      );
    }

    if (hasErrored) {
      return (
        <Container>
          <Message
            header="Something Went Wrong!"
            content="There's been an error loading this page. How about checking out some art and coming back in a minute?"
          />
          <a onClick={() => this.showErrorToggle()}>Details</a>
          <Message
            hidden={!this.state.showError}
            content={`${error.status}: ${error.message}`}
          />
        </Container>
      );
    }

    return (
      <div>
        <h3>Closed Auctions</h3>
        <Grid columns="equal">
          <Grid.Row columns={3}>
            {closedAuctions.length > 0 ? closedAuctions.map(auction => (
              <ClosedAuction
                auction={auction}
                history={history}
              />
              )
            ) : 
            <Container>
              <Message
                header="You're not Bidding on any art"
                content="You dream piece is waiting for you. Click below to find it."
              />
              <Button onClick={() => this.goToAuctions()}>Go to Auctions</Button>
            </Container>}
          </Grid.Row>
        </Grid>
        <h3>Ongoing Auctions</h3>
        <Grid columns="equal">
          <Grid.Row>
            {openAuctions.length > 0 ? openAuctions.map(auction => (
              <OpenAuction
                history={history}
                auction={auction}
              />
              )
            ) :
            <Container>
              <Message
                header="You have won any auctions... Yet"
                content="You dream piece is waiting for you. Click below to find it."
              />
              <Button onClick={() => this.goToAuctions()}>Go To Auctions</Button>
            </Container>}
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userAuctions: state.userAuctions,
    user: state.user
  };
};

export default connect(mapStateToProps)(UserAuctions);

