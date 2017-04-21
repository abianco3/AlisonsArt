import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as UserActions from './../actions/userActionCreator.jsx';

class ContactUs extends Component {
  componentWillMount() {
    let { dispatch } = this.props;
    fetch('/contactus', {
      method: 'GET',
      headers: new Headers ({
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      })
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
      alert(err.message);
    });
  }

  render(){
    return(
      <div>
        Contact us at: xxxxx
      </div>
    );
  }
}

export default connect()(ContactUs);
