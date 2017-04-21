import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Message } from 'semantic-ui-react';
import * as UserActions from './../actions/userActionCreator.jsx';

class SignUp extends Component {

  _handleSubmit(e) {
    e.preventDefault();
    let { dispatch } = this.props;

    let username = this.usernameNode.value;
    let password = this.passwordNode.value;
    let cPassword = this.cPasswordNode.value;
    let email = this.emailNode.value;
    let lastName = this.firstNameNode.value;
    let firstName = this.lastNameNode.value;
    let address = this.streetNode.value + ', ' + this.cityNode.value + ', ' + this.stateNode.value;
    
    if (!username || !password || !email || !lastName || !firstName || !address) {
      return dispatch(UserActions.loginError('all fields are required'));
    }

    this.usernameNode.value = '';
    this.passwordNode.value = '';
    this.cPasswordNode.value = '';
    this.emailNode.value = '';
    

    if (password === cPassword) {
      fetch('/auth/signup', {
        //don't forget the headers, otherwise it won't work
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        method: 'POST',
        body: JSON.stringify({
          username: username, 
          password: password,
          email: email,
          address: address,
          first_name: firstName,
          last_name: lastName,
          type: 'user'
        })
      }).then(response => {
        dispatch(UserActions.checkingInfo(true));
        if (!response.ok) {
          return response.text()
          .then((message) => {
            throw new Error(message);
          });
        }

        dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId') === 'artist'));
        
        return response.json();
      }).then(data => {
        localStorage.setItem('authToken', data);
        dispatch(UserActions.checkingInfo(false));
        //push user to Homepage:
        this.props.history.push('/home');
        this.streetNode.value = '';
        this.cityNode.value = '';
        this.stateNode.value = '';
        this.firstNameNode.value = '';
        this.lastNameNode.value = '';
      }).catch(err => {
        dispatch(UserActions.checkingInfo(false));
        dispatch(UserActions.loginError(err.message));
      });
    } else {
      alert('please enter matching passwords!');
    }

  }

  render() {
    const { error } = this.props.user;

    return (
      <div className='authForm'>
        <h3>Sign Up</h3>
        <Form error={!!error}>
          <Form.Field required>
            <label>Username</label>
            <input 
              placeholder='username' 
              ref={node => this.usernameNode = node} 
            />
          </Form.Field>
          <Form.Field required>
            <label>Password</label>
            <input 
              type='password' 
              placeholder='password' 
              ref={node => this.passwordNode = node}
            />
          </Form.Field>
          <Form.Field required>
            <label>Confirm Password</label>
            <input 
              type='password' 
              placeholder='password' 
              ref={node => this.cPasswordNode = node}
            />
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field required>
              <label>First Name</label>
              <input 
                placeholder='first' 
                ref={node => this.firstNameNode = node} 
              />
            </Form.Field>
            <Form.Field required>
              <label>Last Name</label>
              <input 
                placeholder='last' 
                ref={node => this.lastNameNode = node} 
              />
            </Form.Field>
          </Form.Group>
          <Form.Field required>
            <label>Email</label>
            <input 
              placeholder='example@example.com' 
              ref={node => this.emailNode = node} 
            />
          </Form.Field>
          <Form.Field required>
            <label>Address</label>
            <input 
              placeholder='address' 
              ref={node => this.streetNode = node} 
            />
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field required>
              <label>City</label>
              <input 
                placeholder='city' 
                ref={node => this.cityNode = node} 
              />
            </Form.Field>
            <Form.Field required>
              <label>State</label>
              <input 
                placeholder='state'
                ref={node => this.stateNode = node} 
              />
            </Form.Field>
          </Form.Group>
          <Message
            error
            header='Invalid Inputs'
            content={error}
          />
          <Button 
            type='submit' 
            onClick={e => {this._handleSubmit(e)}}
          >
            Submit
          </Button>
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

export default connect(mapStateToProps)(SignUp);
