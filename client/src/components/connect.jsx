import React from 'react';
import { connect } from 'react-redux';
import { Image, Form, Container, Button, Grid } from 'semantic-ui-react';
import * as profileActions from '../actions/profileActionCreator';

class Connect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image_url: '',
      preview_image: 'https://www.mountaineers.org/images/placeholder-images/placeholder-400-x-400/image_preview',
      profile: '',
      fb_link: '',
      twitter_link: '',
      inst_link: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.handleImageCreate = this.handleImageCreate.bind(this);
  }
  
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  
  handleImageCreate() {
    this.setState({
      preview_image: 'http://www.theodo.fr/uploads/blog//2015/12/spinner.gif'
    });

    const formData = new FormData();
    formData.append('image_file', document.getElementById('image').files[0]);
    fetch('/images', {
        method: 'POST',
        body: formData,
        headers:  new Headers({
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
        })
    })
    .then((data) => {
      if (!data.ok) {
        throw Error(data.responseText);
      } else {
        return data.json();
      }
    })
    .then((response) => {
      this.setState({
        image_url: response.url,
        preview_image: response.url
      });
    })
    .catch((error) => {
      console.log(error);
      this.setState({
        image_url: 'assets/default.jpg',
        preview_image: 'assets/default.jpg'
      });
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { dispatch } = this.props;

    const profile = {
      image_url: this.state.image_url,
      profile: this.state.profile,
      fb_link: this.state.fb_link,
      twitter_link: this.state.twitter_link,
      inst_link: this.state.inst_link
    };
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
    });

    return fetch('/artist/profile', {
      method: 'POST',
      headers : headers,
      body: JSON.stringify(profile)
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 403) {
          throw Error('403 - Not Authorized');
        } else {
          throw Error(response.status);
        }
      } else {
        return response.text();
      }
    })
    .then((message) => {
      if (message === 'success') {
        dispatch(profileActions.postingSuccess(true));
      }
    })
    .catch((err) => {
      dispatch(profileActions.postingErrored(true, err.message));
    });
  }

  login() {
    const { history, dispatch } = this.props;
    dispatch(profileActions.postingErrored(false, null));
    history.push('/login');
  }

  render() {
    const { profile } = this.props;
    if (profile.success) {
      return (
        <a href="stripe/connect"><Button>Connect With Stripe</Button></a>
      );
    } else if (profile.hasErrored) {
      if (profile.error === '403 - Not Authorized') {
        return (
          <Button onClick={this.login}>Please Login</Button>
        );
      } else {
        return (
          <h3>Something went wrong, please try again later</h3>
        );
      }
    } else {
      return (
        <Container>
          <Form>
            <Grid>
              <Grid.Row columns={2}>
                <Grid.Column width={6}>
                  <Image
                    src={this.state.preview_image}
                  />
                </Grid.Column>
                <Grid.Column width={10}>
                  <input
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    id="image"
                    onChange={this.handleImageCreate}
                  />
                  <Form.TextArea
                    label="Profile"
                    name="profile"
                    value={this.state.profile}
                    onChange={this.handleChange}
                    required
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Form.Input 
              label="Facebook Link"
              name="fb_link"
              value={this.state.fb_link}
              onChange={this.handleChange}
            />
            <Form.Input 
              label="Twitter Link"
              name="twitter_link"
              value={this.state.twitter_link}
              onChange={this.handleChange}
            />
            <Form.Input
              label="Instagram Link"
              name="inst_link"
              value={this.state.inst_link}
              onChange={this.handleChange}
            />
            <Button onClick={(e) => this.handleSubmit(e)}>Create Your Artist Profile!</Button>
          </Form>
        </Container>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    profile: state.profile
  };
};

export default connect(mapStateToProps)(Connect);
