import React, { Component } from 'react';
import { Grid, Card, Image, Divider, Container, Dimmer, Loader } from 'semantic-ui-react';
import ImageGallery from 'react-image-gallery';
import { connect } from 'react-redux';
import * as Auctions from '../actions/auctionActionCreator.jsx';
import * as Artists from '../actions/artistActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

const clickArt = (auctionId, history) => {
  history.push('/auction/' + auctionId);
};

const onImageClick = (event, history) => {
  var split = event.target.src.split('?');
  var lastIndex = split.length - 1;
  var lastCharacter = Number(split[lastIndex]);
  clickArt(lastCharacter, history);
}

//render the description ... as floating right of the image
//closed auctions should be rendered differently from the ongoing ones
const MainArt = ({ art, history }) => {
  return (
    <Grid.Column>
      <Image src={art.artwork.image_url}/>
      <Card.Content>
        <Card.Header>{art.first_name} {art.last_name} </Card.Header>
        <Card.Meta>{art.artwork.age}</Card.Meta>
        <Card.Description>{art.artwork.description}</Card.Description>
      </Card.Content>
    </Grid.Column>
  );
}

const MainArts = ({ mainArts, history }) => {
  if (!mainArts[0]) {
    return <p>loading...</p>
  } else {
    let images = []
    mainArts.forEach((item) => {
      let imageObj = {
        original: `${item.artwork.image_url}?${item.id}`,
        description: `${item.first_name} ${item.last_name} Closing Price: $${item.buyout_price}`, 
      }
      images.push(imageObj);
    })
    //shoud add acution id to onImage click
    return (
      <div className='carousel'>
        <ImageGallery
          items={images}
          slideInterval={7000}
          autoPlay={true}
          showThumbnails={false}
          showFullscreenButton={false}
          showPlayButton={false}
          onClick={(e) => {onImageClick(e, history)}}
        />
      </div>
    )
  }
}
//the images, when onClick, will lead to bidding page(filled with info for just this artwork).

const HomeAuction = ({ homeAuction, history }) => {
  return (
    <Grid.Column>
      <Image 
        className='imageLink'
        src={homeAuction.artwork.image_url} 
        onClick={() => {clickArt(homeAuction.id, history);}}
        label={{ as: 'a', color: 'black', content: '$' + homeAuction.current_bid, ribbon: true }} 
      />
      <Container>
        <h4 className='imageHeader'>
          {homeAuction.artwork.art_name}
        </h4>
        <p>{homeAuction.first_name} {homeAuction.last_name} ({homeAuction.artwork.age})</p>
      </Container>
    </Grid.Column>
  );
}
//not using dispatch for the moment
const HomeAuctions = ({homeAuctions, history}) => {
  if (!homeAuctions[0]) {
    return <p>loading~~~</p>
  } else {
    return (
      <Grid columns='equal'>
        <Grid.Row columns={3}>
          {homeAuctions.map(homeAuction => <HomeAuction key={homeAuction.artwork.id} homeAuction={homeAuction} history={history} />)}
        </Grid.Row>
      </Grid>
    )
  }
}
//dispatch is not in use: 
const clickArtist = (id, history, dispatch) => {
  history.push('/artist/' + id);
}

const HomeArtist = ({ artist, history }) => {
  return (
    <Grid.Column>
        <Image 
          className='imageLink'
          src={artist.image_url} 
          onClick={() => clickArtist(artist.artist_id, history)} 
        />
        <Container>
          <h4 className='imageHeader'>
            {artist.first_name} {artist.last_name}
          </h4>
          <Divider />
          <p>CATEGORY TAGS GO HERE</p>
        </Container>
    </Grid.Column>
  )
}

const HomeArtists = ({ homeArtists, history }) => {
  if(!homeArtists[0]) {
    return <div>loading~~~~</div>
  } else {
    return (
      <Grid>
        <Grid.Row columns={3}>
          {homeArtists.map(homeArtist => <HomeArtist key={homeArtist.id} artist={homeArtist} history={history} />)}
        </Grid.Row>
      </Grid>
    )
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
    // Auctions.fetchAuctionData('/auctions');
      dispatch(Auctions.fetchingAuctions(true));

      fetch('/home', {
        method: 'GET',
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        if (response.headers.get('x-username') && response.headers.get('x-userId')) {
          dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId'), response.headers.get('x-type')));
        }
        dispatch(Auctions.fetchingAuctions(false));
        return response.json();
      })
      .then(data => {
        let {current, expired, featuredArt} = data;
        dispatch(Auctions.passedAuctionsFetchedSuccess(expired));
        dispatch(Auctions.ongoingAuctionsFetchedSuccess(current));
        dispatch(Auctions.featuredArtsFetchedSuccess(featuredArt));
      })
      .catch(() => {
        dispatch(Auctions.fetchingAuctions(false));
        dispatch(Auctions.fetchAuctionErrored(true));
      });
  }
 
    render() {
      return (
        <div>
          <MainArts mainArts={this.props.mainArts} history={this.props.history} />
          <Divider />
          <h3>Auctions</h3>
          <HomeAuctions homeAuctions={this.props.homeAuctions} history={this.props.history} />
          <h3>Artists</h3>
          <Divider />
          <HomeArtists homeArtists={this.props.homeArtists} history={this.props.history} />
        </div>
      )
    }
}

const mapStateToProps = (state) => {
  //currently because there are no passed auctions, replaced
  // mainArts: state.auctions.fetchedPassedAuctions in here. but change it back should make things work fine later.
  return {
    mainArts: state.auctions.fetchedPassedAuctions,
    homeAuctions: state.auctions.fetchedOngoingAuctions,
    homeArtists: state.auctions.fetchedFeaturedArts
  }
};

export default connect(mapStateToProps)(Home);
