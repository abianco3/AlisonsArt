import React, { Component } from 'react';
import { Container, Image } from 'semantic-ui-react';
import * as Auctions from '../actions/auctionActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';
import { connect } from 'react-redux';
import AuctionDetail from './AuctionDetail.jsx';
import ClosedAuction from './ClosedAuction.jsx';
import * as bids from '../actions/bidActionCreator';
import Moment from 'moment';


class Auction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      flag: false
    };
  }

  //when user clicks submit, check if user is logged in
    //if not re-direct
    //if logged in, grab all info and redirect to payment page.
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
    //lala:
    if (user.username) {
      fetch('/saves/?q=' + user.userId + '+' + auctionId)
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
    fetch('/saves/save', {
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
    fetch('/saves/unsave', {
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
    dispatch(bids.setBid(bid));
  }

  handleClick(id) {
    const { bid, user, history, dispatch } = this.props;
    if (bid.bid === 0) {
      alert('Please select a value');
    } else {
      //if user not logged in, redirect
      if(!user.username) {
        alert('you are not logged in, please sign up or log in');
        history.push('/login');
      } else {
      //grab userid, artwork_id and value
        dispatch(bids.toggleSend());
        fetch(`/auctions/${id}/bids`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }),
          body: JSON.stringify({ bidPrice: bid.bid })
        })
        .then((answer) => {
          if (!answer.ok) {
            throw Error(answer.json());
          } else {
            answer.json()
            .then((bid) => {
              dispatch(Auctions.updateBid(bid));
              alert(`you have successfully bid $${bid.current_bid}`);

            });
          }
        })
        .catch((err) => {
          dispatch(bids.error(err));
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
              handleClick={this.handleClick.bind(this, auction.id)}
              auction={auction}
              setBid={this.setBid.bind(this)}
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
//connect to the store to get the artwork to render:
const mapStateToProps = (state) => {
  return {
    auction: state.auction,
    user: state.user,
    bid: state.bid,
  }
}
export default connect(mapStateToProps)(Auction);