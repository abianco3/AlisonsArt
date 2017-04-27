import React, { Component } from 'react';
import { Container, Image } from 'semantic-ui-react';
import * as Auctions from '../actions/auctionActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';
import { connect } from 'react-redux';
import AuctionDetail from './AuctionDetail.jsx';
import ClosedAuction from './ClosedAuction.jsx';
import * as Bids from '../actions/bidActionCreator';
import Moment from 'moment';


class Auction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      flag: false
    };
    this.setBid = this.setBid.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    const auctionId = this.props.match.params.auctionId;
    const { dispatch, user } = this.props;
    dispatch(Auctions.fetchingAnAuction(true));
    fetch(`/auctions/${auctionId}`)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
        dispatch(Auctions.fetchingAnAuction(false));
        return response.json();
    })
    .then(data => {
      dispatch(Auctions.fetchedAnAuction(data[0]));
    })
    .catch(err => {
      dispatch(Auctions.fetchingAnAuction(false));
      dispatch(Auctions.fetchAuctionErrored(true, err));
    });

    if (user.username) {
      fetch(`/saves/?q=${user.userId}+${auctionId}`)
      .then(response => {
        if(!response.ok) {
          throw Error(response.statusText);
        }
        return response.text();
      })
      .then(data => {
        if (data === 'success') {
          this.setState({flag: true});
        } else {
          this.setState({flag: false});
        }
      })
      .catch(err => {
        console.log(err.message);
      });
    }
  }

  handleSave(auction_id) {
    fetch(`/saves/save`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }),
      body: JSON.stringify(auction_id)
    })
    .then(response => {
      if(!response.ok) {
        throw Error('failed to save!');
      }
      return true;
    })
    .then(data => {
      this.setState({flag: true});
    })
    .catch(err => {
      alert('Something went wrong, can\'t save auction');
    });
  }

  handleUnsave(auction_id) {
    fetch(`/saves/unsave`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }),
      body: JSON.stringify(auction_id)
    })
    .then(response => {
      if(!response.ok) {
        throw Error('failed to unsave!');
      }
      return true;
    })
    .then(data => {
      this.setState({flag: false});
    })
    .catch(err => {
      alert('Something went wrong, can\'t unsave auction');
    });
  }

  setBid(bid) {
    const { dispatch } = this.props;
    dispatch(Bids.setBid(bid));
  }

  handleClick(auctionId, avail, buyout) {
    const { bid, user, history, dispatch } = this.props;
    //this is for invalid input:
    let temp = bid.bid;
    if(!user.username) {
      history.push('/login');
    } else {
      if (!bid.bid){
        alert('Please enter a valid value');
      } else if(bid.bid < avail) {
        alert('Please at least bid for the next available amount');
      } else if(bid.bid > buyout) {
        alert('How about bidding for the buyout amount?');
      } else {
        fetch(`/auctions/${auctionId}/bids`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }),
          body: JSON.stringify({
            bidPrice: Number((+bid.bid).toFixed(2))
          })
        })
        .then(response => {
          if (!response.ok) {
            throw Error(response.json());
          }
          return response.json();
        })
        .then(data => {
          bid.current_bid = data.current_bid;
          bid.current_bid_id = data.current_bid_id;
          dispatch(Auctions.updateBid(bid));
          alert(`You have successfully bid $${data.current_bid}`);
        })
        .catch(err => {
          dispatch(Bids.error(err));
        });
      }
    }
  }

  clickArtist(artistId) {
    const { history } = this.props;
    history.push(`/artist/${artistId}`);
    return false;
  }

  render() {

    const { auction } = this.props.auction;
    const { bid, user } = this.props;
    if (Object.keys(auction).length === 0) {
      return (
        <p>loading~~~</p>
      );
    } else {
      const end = new Moment(auction.end_date);
      const now = new Moment();
      if (end.isBefore(now)) {
        return (
          <ClosedAuction
            flag={this.state.flag}
            user={user}
            auction={auction}
            handleSave={() => { this.handleSave(auction.id); }}
            handleUnsave={() => { this.handleUnsave(auction.id); }}
            clickArtist={() => { this.clickArtist(auction.owner_id); }}
          />
        );
      } else {
        return (
          <div>
            <AuctionDetail
              flag={this.state.flag}
              user={user}
              bid={bid}
              handleClick={this.handleClick}
              auction={auction}
              setBid={this.setBid}
              handleSave={() => { this.handleSave(auction.id); }}
              handleUnsave={() => { this.handleUnsave(auction.id); }}
              clickArtist={() => { this.clickArtist(auction.owner_id); }}
            />
          </div>
        );
      }
    }
  }
}

const mapStateToProps = (state) => {
  return {
    auction: state.auction,
    user: state.user,
    bid: state.bid
  }
}
export default connect(mapStateToProps)(Auction);