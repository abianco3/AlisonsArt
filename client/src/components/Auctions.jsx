import React from 'react';
import { connect } from 'react-redux';
import { Container, Image, Grid, Divider } from 'semantic-ui-react';
import * as actions from '../actions/auctionActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

const _formatMoney = (money) => {
  return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};

class Auctions extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(actions.fetchingAuctions(true));

    fetch(`/auctions`, {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      })
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.json());
      } 
        dispatch(actions.fetchingAuctions(false));
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
    const { auctions } = this.props;
    if (auctions.length === 0) {
      return <div>loading~~</div>;
    } else {
      return (
        <Container>
          <Grid>
            <Grid.Row columns={3}>
              {auctions.map(auction => (
                <Grid.Column className="frame-squre" key={auction.id}>
                  <div className="imageLink thumbnails" style={{backgroundImage: `url(${auction.artwork.image_url})`}} onClick={() => this.goToAuction(auction.id)} >
                  <a className="ui ribbon label black">${_formatMoney(+auction.current_bid)}</a>
                  </div>
                  <Container>
                    <h4 className="artName">
                      {auction.artwork.art_name}
                    </h4>
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
}

const mapStateToProps = (state) => {
  return {
    auctions: state.auctions.fetchedOngoingAuctions
  };
};

export default connect(mapStateToProps)(Auctions);
