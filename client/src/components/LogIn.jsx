import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Message } from 'semantic-ui-react';
import * as UserActions from './../actions/userActionCreator.jsx';

//when login success, needs to save info in userReducer
class LogIn extends Component {

  _handleSubmit(e) {
    e.preventDefault();
    let { dispatch } = this.props;
    let username = this.usernameNode.value;
    let password = this.passwordNode.value;

    if (!username || !password) {
      return dispatch(UserActions.loginError('invalid inputs'));
    }
    this.usernameNode.value = '';
    this.passwordNode.value = '';

    fetch('/auth/login', {
      //don't forget the headers, otherwise it won't work
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      method: 'POST',
      body: JSON.stringify({
        username: username, 
        password: password
      })
    }).then(response => {
      dispatch(UserActions.checkingInfo(true));
      if(!response.ok) {
        throw Error('Log in post not ok!');
      }

      dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId'), response.headers.get('x-type') === 'artist'));
      return response.json();
    }).then(data => {
      dispatch(UserActions.checkingInfo(false));
      localStorage.setItem('authToken', data);
      this.props.history.push('/home');
    }).catch(err => {
      dispatch(UserActions.checkingInfo(false));
      dispatch(UserActions.loginError(err));
    });
  }  

  render(){
    const { error } = this.props.user;

    return (
      <div className='authForm'>
        <h3>Login</h3>
        <Form error={!!error}>
          <Form.Field required>
            <label>Username</label>
            <input placeholder='username' required ref={node => this.usernameNode = node} />
          </Form.Field>
          <Form.Field required>
            <label>Password</label>
            <input type='password' required placeholder='password' ref={node => this.passwordNode = node} />
          </Form.Field>
          <Message
            error
            header='Try Again'
            content='Username and Password are not correct'
          />
          <Button type='submit' onClick={e => {this._handleSubmit(e)}}>Submit</Button>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(LogIn);

