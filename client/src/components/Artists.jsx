import React from 'react';
import { connect } from 'react-redux';
import { Message, Icon, Container, Grid, Button, Divider, Image } from 'semantic-ui-react';
import * as actions from '../actions/artistsActionCreator.jsx';

class Artists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(actions.fetchingArtists(true));

    fetch('/artist')
    .then((response) => {
      if (!response.ok) {
        const error = new Error(response.statusText);
        error.status = response.status;
        throw error;
      }
      return response.json();
    })
    .then((artists) => {
       dispatch(actions.fetchedArtistsSuccess(artists));
       dispatch(actions.fetchingArtists(false));
    })
    .catch((err) => {
      console.log(err);
      dispatch(actions.fetchingArtists(false));
      dispatch(actions.fetchArtistsError(true, err));
    });
  }

  createAccount() {
    this.props.history.push('/createAuction');
  }

  showErrorToggle() {
    this.setState({
      showError: !this.state.showError
    });
  }

  goToArtist(artistId) {
    this.props.history.push(`/artist/${artistId}`);
  }

  render() {
    const { artists, error, hasErrored, isFetching } = this.props;

    if (isFetching) {
      return (
        <Message icon>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>Just a second!</Message.Header>
            Artists are on the way.
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

    if (artists.length === 0) {
      return (
        <Container>
          <Message
            header="There don't seem to be any artists on ArtPoint. Hmmm... Will you be the first?"
            content="Signing up is quick and easy, click here to get started."
          />
          <Button onClick={() => this.createAccount()}>Make a Listing!</Button>
        </Container>
      );
    }

    return (
      <Container>
        <Grid>
          {artists.map(artist => (
            <Grid.Row columns={2}>
              <Grid.Column width={6} key={artist.id}>
                <Image
                  className="imageLink"
                  verticalAlign="top"
                  size="medium"
                  src={artist.image_url}
                  onClick={() => this.goToArtist(artist.id)} 
                />
              </Grid.Column>
              <Grid.Column width={10}>
                <h4 className="imageHeader">
                  {artist.first_name} {artist.last_name}
                </h4>
                <p className="artworkDescription">{artist.profile}</p>
              </Grid.Column>
            </Grid.Row>
            )
          )}
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    artists: state.artists.fetchedArtists,
    error: state.artists.fetchArtistsError,
    hasErrored: state.artists.fetchArtistsErrored,
    isFetching: state.artists.isFetching
  };
};

export default connect(mapStateToProps)(Artists);
