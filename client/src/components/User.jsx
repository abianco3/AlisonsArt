import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image, Divider, Container } from 'semantic-ui-react';
import {
  HashRouter as Router,
  Route,
  IndexRoute,
  hashHistory,
  NavLink
} from 'react-router-dom';

import SaveFollow from './SaveFollow.jsx';
import UserAuctions from './userAuctions/UserAuctions.jsx';
import UserSettings from './UserSettings.jsx';
import Payments from './Payments.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

const Navigation = (props) => {
  return (
    <Container>
      <NavLink to={"/user/" + props.userId + '/savesFollows'}>Saves & Follows</NavLink>
      {'  '}
      <NavLink to={"/user/" + props.userId + '/auctions'}>Auctions</NavLink>
      {'  '}
      <NavLink to={"/user/" + props.userId + '/settings'}>Settings</NavLink>
      {'  '}
      <NavLink to={"/user/" + props.userId + '/payments'}>Payments</NavLink>
    </Container>
  );
}

class User extends Component {
  componentWillMount() {
    let { dispatch } = this.props;
    fetch('/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(response => {
      if(!response.ok) {
        throw Error('authorization error');
      }
      
      if (response.headers.get('x-username') && response.headers.get('x-userId')) {
        dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId'), response.headers.get('x-type') === 'artist'));
      }
    })
    .catch(err => {
      //change the error name later
      alert(err.message);
    })
  }
  render() {
    if (!this.props.user.username) {
      return (<div>Please log in</div>);
    } else {
      return (
        <Container>
          <Container>
            {this.props.user.username[0].toUpperCase().concat(this.props.user.username.slice(1))}
          </Container>
        <Divider />
        <Router>
          <Container>
            <Navigation userId={this.props.user.userId} />
            <Route path="/user/:userId/savesFollows" component={SaveFollow} />
            <Route path="/user/:userId/auctions" component={UserAuctions} />
            <Route path="/user/:userId/settings" component={UserSettings} />
            <Route path="/user/:userId/payments" component={Payments} />
          </Container>
        </Router>
        </Container>
      );
    }
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(User);