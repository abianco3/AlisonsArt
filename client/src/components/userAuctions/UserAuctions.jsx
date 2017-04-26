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
    closedAuctions = [
      {
        "id": 7,
        "owner_id": "3",
        "artwork_id": "13",
        "start_date": "2017-04-09T21:27:07.000Z",
        "end_date": "2017-04-18T17:27:07.000Z",
        "start_price": "13000",
        "buyout_price": "20000",
        "current_bid": "17000",
        "current_bid_id": "5",
        "bid_counter": "1",
        "art_name": "That is a Red Bush (13)",
        "image_url": "https://s-media-cache-ak0.pinimg.com/originals/c1/f0/26/c1f0269023694d21a8786f928ec92072.jpg",
        "age": "1813's",
        "description": "It looks like its by a river bank. Maybe.",
        "dimensions": "399 x 480",
        "first_name": "Anthony",
        "last_name": "Bianco",
        "closed": true,
        "won": true
      },
      {
        "id": 8,
        "owner_id": "2",
        "artwork_id": "14",
        "start_date": "2017-04-09T21:27:07.000Z",
        "end_date": "2017-04-18T17:27:07.000Z",
        "start_price": "13000",
        "buyout_price": "20000",
        "current_bid": "17000",
        "current_bid_id": "6",
        "bid_counter": "1",
        "art_name": "A sea... arch? (14)",
        "image_url": "https://cdn0.vox-cdn.com/thumbor/5ec3wGPmJ7JQtxGbJc68E9hrsoE=/0x73:800x523/1600x900/cdn0.vox-cdn.com/assets/3905027/800px-Monet_-_Sonnenaufgang_bei_Etretat.jpg",
        "age": "1814's",
        "description": "I saw one of these last time I was in Ensenada. I should figure out what these are called",
        "dimensions": "399 x 480",
        "first_name": "Alison",
        "last_name": "Zhang",
        "closed": true,
        "won": true
      },
      {
        "id": 9,
        "owner_id": "4",
        "artwork_id": "16",
        "start_date": "2017-04-09T21:27:07.000Z",
        "end_date": "2017-04-18T17:27:07.000Z",
        "start_price": "13000",
        "buyout_price": "20000",
        "current_bid": "17000",
        "current_bid_id": "7",
        "bid_counter": "1",
        "art_name": "A Tunnel of Plants (16)",
        "image_url": "https://s-media-cache-ak0.pinimg.com/originals/c0/db/0c/c0db0ccb6ca1d535a7cf5ea1f0698488.jpg",
        "age": "1816's",
        "description": "I don't know what this is. I almost cut my ear off painting this.",
        "dimensions": "399 x 480",
        "first_name": "Bryan",
        "last_name": "Nguyen",
        "closed": true,
        "won": true
      }
    ];
    const { history } = this.props;
    let closedAuctionsDiv = null;

    if (isFetching) {
      return (
        <div>Loading~~~~~</div>
      );
    }

    // if (closedAuctions.length > 0) {
    //   closedAuctionsDiv = {closedAuctions.map(auction => (
    //     <ClosedAuction auction={auction} />
    //     )
    //   )}
    // }

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

