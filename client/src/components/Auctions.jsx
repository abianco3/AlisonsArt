import React from 'react';
import { connect } from 'react-redux';
import { Container, Image, Grid, Divider, Message, Icon } from 'semantic-ui-react';
import * as actions from '../actions/auctionActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

class Auctions extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(actions.fetchingAuctions(true));

    fetch('/auctions', {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
      })
    })
    .then((response) => {
      if (!response.ok) {
        const error = new Error(response.statusText);
        error.status = response.status;
        throw error;
      } 
      dispatch(actions.fetchingAuctions(false));
      if (response.headers.get('x-username') && response.headers.get('x-userId')) {
        dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId'), response.headers.get('x-type') === 'artist'));
      }
      return response.json();
    })
    .then((auctions) => {
      dispatch(actions.ongoingAuctionsFetchedSuccess(auctions));
    })
    .catch((err) => {
      dispatch(actions.fetchingAuctions(false));
      dispatch(actions.fetchAuctionErrored(true, err));
    });
  }

  goToAuction(id) {
    const { history } = this.props;
    history.push(`/auction/${id}`);
  }

  render() {
    const { auctions, isFetching, hasErrored, error } = this.props;
    if (isFetching) {
      return (
        <Message icon>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>Just a second!</Message.Header>
            Auctions are on the way.
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
        </Container>
      );
    }

    if (auctions.length === 0) {
      return (
        <Container>
          <Message
            header="There doesn't seem to be any content here. Maybe you should make some."
            content="Signing up is quick and easy, click here to get started."
          />
        </Container>
      );
    }

    return (
      <Container>
        <Grid divided>
          <Grid.Row columns={3}>
            {auctions.map(auction => (
              <Grid.Column key={auction.id}>
                <Image
                  className="imageLink"
                  src={auction.artwork.image_url}
                  onClick={() => this.goToAuction(auction.id)}
                  label={{ as: 'a', color: 'black', content: '$' + auction.current_bid, ribbon: true }} 
                  height="100%"
                />
                <Container>
                  <h4 className="imageHeader">
                    {auction.artwork.art_name}
                  </h4>
                  <Divider />
                  <p className="artworkDescription">{auction.artwork.description}</p>
                </Container>
              </Grid.Column>
              )
            )}
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auctions: state.auctions.fetchedOngoingAuctions,
    isFetching: state.auctions.isFetching,
    hasErrored: state.auctions.hasErrored,
    error: state.auctions.fetchAuctionsError
  };
};

export default connect(mapStateToProps)(Auctions);
