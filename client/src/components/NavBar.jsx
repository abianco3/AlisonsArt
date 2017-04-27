import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import * as UserActions from './../actions/userActionCreator.jsx';
import * as SocketActions from './../actions/socketActionCreator.jsx';
import * as ChatActions from './../actions/chatActionCreator.jsx';

class NavBar extends Component {
  handleLogout(userId) {
    let { dispatch } = this.props;
    sessionStorage.removeItem('authToken');
    dispatch(SocketActions.logoutSocket(userId));
    dispatch(ChatActions.clearChat());
    dispatch(UserActions.logOut());
  }

  render() {
    let {username, userId} = this.props;

    let LoggedOutNav = (
        <span>
          <NavLink className='navLinks' to="/login" >Log In</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/signup" >Sign Up</NavLink>
        </span>
      );

    let LoggedInNav = (
      <span>
        {'  '}
        <NavLink className='navLinks' to={"/user/"+userId + "/savesFollows"} >{username}</NavLink>
        {' | '}
        <NavLink className='navLinks' to="/home" onClick={() => {
          this.handleLogout(userId);
        }}>Log out</NavLink>
        {' | '}
        <NavLink className='navLinks' to="/notification" >Noties</NavLink>
      </span>
    );

    return (
      <span className='navbar'>
        <h1> <Image avatar src='./assets/logo.png' />ArtPoint</h1>
        <span className='navBar'>
          {'  '}
          <NavLink className='navLinks' to="/home">Home</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/auctions">Auctions</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/artists" >Artists</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/createAuction" >Create an auction</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/events" >Events</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/contactus" >Contact us</NavLink>
        </span>
        <span className='authLink'>
          {username === '' ? LoggedOutNav : LoggedInNav}
          {this.props.children}
        </span>
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    userId: state.user.userId
  }
}

export default connect(mapStateToProps)(NavBar);
