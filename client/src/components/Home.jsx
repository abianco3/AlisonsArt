import React, { Component } from 'react';
import { Grid, Card, Image, Divider, Icon, Container, Dimmer, Loader, Message } from 'semantic-ui-react';
import ImageGallery from 'react-image-gallery';
import { connect } from 'react-redux';
import * as Auctions from '../actions/auctionActionCreator.jsx';
import * as Artists from '../actions/artistActionCreator.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

const clickArt = (auctionId, history) => {
  history.push(`/auction/${auctionId}`);
};

const onImageClick = (event, history) => {
  var split = event.target.src.split('?');
  var lastIndex = split.length - 1;
  var lastCharacter = Number(split[lastIndex]);
  clickArt(lastCharacter, history);
};

const _formatMoney = (money) => {
  return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};

const MessageWrapper = ({ data, isFetching, hasErrored, error, Component, history }) => {
  if (isFetching) {
    return (
      <Message icon>
        <Icon name="circle notched" loading />
        <Message.Content>
          <Message.Header>Just a second!</Message.Header>
          Content is on the way.
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

  if (data.length === 0) {
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
    <Component
      data={data}
      history={history}
    />
  );

};

// render the description ... as floating right of the image
// closed auctions should be rendered differently from the ongoing ones
const MainArt = ({ art, history }) => {
  return (
    <Grid.Column>
      <Image src={art.artwork.image_url} />
      <Card.Content>
        <Card.Header>{art.first_name} {art.last_name} </Card.Header>
        <Card.Meta>{art.artwork.age}</Card.Meta>
        <Card.Description>{art.artwork.description}</Card.Description>
      </Card.Content>
    </Grid.Column>
  );
};

const MainArts = ({ data, history }) => {
  const mainArts = data;
  let images = [];
  mainArts.forEach((item) => {
    const imageObj = {
      original: `${item.artwork.image_url}?${item.id}`,
      description: `${item.first_name} ${item.last_name} Closing Price: $${_formatMoney(+item.buyout_price)}`, 
    };
    images.push(imageObj);
  });
  // shoud add acution id to onImage click
  return (
    <div className="carousel">
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
  );
};

const HomeAuction = ({ homeAuction, history }) => {
  return (
    <Grid.Column>
      <div className="imageLink thumbnails" style={{backgroundImage: `url(${homeAuction.artwork.image_url})`}} onClick={() => {clickArt(homeAuction.id, history)}} >
      <a className="ui ribbon label black">${_formatMoney(+homeAuction.current_bid)} </a>
      </div>
      
      <Container>
        <h4 className="imageHeader">
          {homeAuction.artwork.art_name}
        </h4>
        <p>{homeAuction.first_name} {homeAuction.last_name} ({homeAuction.artwork.age})</p>
      </Container>
    </Grid.Column>
  );
};

const HomeAuctions = ({ data, history }) => {
  const homeAuctions = data;
  return (
    <Grid columns="equal">
      <Grid.Row className="frame-square" columns={3}>
        {homeAuctions.map(homeAuction => <HomeAuction key={homeAuction.artwork.id} homeAuction={homeAuction} history={history} />)}
      </Grid.Row>
    </Grid>
  );
};

const clickArtist = (id, history, dispatch) => {
  history.push(`/artist/${id}`);
};

const HomeArtist = ({ artist, history }) => {
  return (
    <Grid.Column>
      <div
        className="imageLink thumbnails" style={{backgroundImage: `url(${artist.image_url})`}}
        onClick={() => clickArtist(artist.artist_id, history)} 
      />
      <Container>
        <h4 className="imageHeader">
          {artist.first_name} {artist.last_name}
        </h4>
      </Container>
    </Grid.Column>
  );
};

const HomeArtists = ({ data, history }) => {
  const homeArtists = data;
  return (
    <Grid>
      <Grid.Row columns={3}>
        {homeArtists.map(homeArtist => <HomeArtist key={homeArtist.id} artist={homeArtist} history={history} />)}
      </Grid.Row>
    </Grid>
  );
};

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
    // Auctions.fetchAuctionData('/auctions');
    dispatch(Auctions.fetchingAuctions(true));

    fetch(`/home`)
    .then((response) => {
      if (!response.ok) {
        const error = new Error(response.statusText);
        error.status = response.error;
        throw error;
      }
      dispatch(Auctions.fetchingAuctions(false));
      return response.json();
    })
    .then((data) => {
      let { current, expired, featuredArt } = data;
      dispatch(Auctions.passedAuctionsFetchedSuccess(expired));
      dispatch(Auctions.ongoingAuctionsFetchedSuccess(current));
      dispatch(Auctions.featuredArtsFetchedSuccess(featuredArt));
    })
    .catch(() => {
      dispatch(Auctions.fetchingAuctions(false));
      dispatch(Auctions.fetchAuctionErrored(true, err));
    });
  }

  render () {
    const { mainArts, homeAuctions, homeArtists, hasErrored, error, history, isFetching } = this.props;
    return (
      <div>
        <MessageWrapper
          Component={MainArts}
          data={mainArts}
          isFetching={isFetching}
          hasErrored={hasErrored}
          error={error}
          history={history}
        />
        <Divider />
        <h3>Auctions</h3>
        <MessageWrapper
          Component={HomeAuctions}
          data={homeAuctions}
          isFetching={isFetching}
          hasErrored={hasErrored}
          error={error}
          history={history}
        />
        <h3>Artists</h3>
        <Divider />
        <MessageWrapper
          Component={HomeArtists}
          data={homeArtists}
          isFetching={isFetching}
          hasErrored={hasErrored}
          error={error}
          history={history}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  // currently because there are no passed auctions, replaced
  // mainArts: state.auctions.fetchedPassedAuctions in here. but change it back should make things work fine later.
  return {
    mainArts: state.auctions.fetchedPassedAuctions,
    homeAuctions: state.auctions.fetchedOngoingAuctions,
    homeArtists: state.auctions.fetchedFeaturedArts,
    isFetching: state.auctions.isFetching,
    hasErrored: state.auctions.hasErrored,
    error: state.auctions.fetchAuctionsError
  };
};

export default connect(mapStateToProps)(Home);
