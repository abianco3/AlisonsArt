import React, { Component } from 'react';
import { Container, Image, Grid } from 'semantic-ui-react';
import * as userAuctions from '../../actions/userAuctionsActionCreator';
import ClosedAuction from './ClosedAuction.jsx';
import OpenAuction from './OpenAuction.jsx';
import { connect } from 'react-redux';

class UserAuctions extends Component {
  constructor(props) {
    super(props);
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
        throw Error(response.statusText);
      }
        dispatch(userAuctions.fetchingUserAuctions(false));
        return response.json();
    })
    .then(data => {
      console.log(data);
      dispatch(userAuctions.userAuctionsFetched(data));
    })
    .catch((err) => dispatch(userAuctions.userAuctionsErrored(err)));
  }

  render() {
    let { openAuctions, closedAuctions, isFetching } = this.props.userAuctions;
    const { history } = this.props;
    let closedAuctionsDiv = null;

    if (isFetching) {
      return (
        <div>Loading~~~~~</div>
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
            ) : ''}
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
            ) : ''}
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

