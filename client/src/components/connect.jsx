import React from 'react';
import { connect } from 'react-redux';
import { Form, Container, Button } from 'semantic-ui-react';
import * as profileActions from '../actions/profileActionCreator';

class Connect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: '',
      fb_link: '',
      twitter: '',
      inst_link: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
  }
  
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { dispatch } = this.props;

    const profile = {
      profile: this.state.profile,
      fb_link: this.state.fb_link,
      twitter: this.state.twitter,
      inst_link: this.state.inst_link
    };
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return fetch('/stripe/connect', {
      method: 'POST',
      headers : headers,
      body: JSON.stringify(profile)
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 403) {
          throw Error('403 - Not Authorized');
        } else {
          throw Error('500');
        }
      } else {
        return response.json();
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
    if (profile.hasErrored) {
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
            <Form.Input 
              label="Profile"
              name="profile"
              value={this.state.profile}
              onChange={this.handleChange}
              required
            />
            <Form.Input 
              label="Facebook Link"
              name="fb_link"
              value={this.state.fb_link}
              onChange={this.handleChange}
            />
            <Form.Input 
              label="Twitter Link"
              name="twitter"
              value={this.state.twitter}
              onChange={this.handleChange}
            />
            <Form.Input
              label="Instagram Link"
              name="inst_link"
              value={this.state.inst_link}
              onChange={this.state.handleChange}
            />
            <Button onClick={(e) => this.handleSubmit(e)}>Connect With Stripe</Button>
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
