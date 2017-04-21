import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import * as UserActions from './../actions/userActionCreator.jsx';

class NavBar extends Component {
  handleLogout() {
    let { dispatch } = this.props;
    localStorage.removeItem('authToken');
      dispatch(UserActions.logOut());
    // setTimeout(function() {
    // }, 2000);
  }
  render() {
    let {username, userId} = this.props;

    let LoggedOutNav = (
        <div>
          <NavLink className='navLinks' to="/login" >Log In</NavLink>
          {' | '}
          <NavLink className='navLinks' to="/signup" >Sign Up</NavLink>
        </div>
      );

    let LoggedInNav = (
      <div>
        {'  '}
        <NavLink className='navLinks' to={"/user/"+userId} >{username}</NavLink>
        {' | '}
        <NavLink className='navLinks' to="/home" onClick={() => {
          this.handleLogout();
        }}>Log out</NavLink>
        {' | '}
        <NavLink className='navLinks' to="/notification" >Noties</NavLink>
      </div>
    );

    return (
      <div>
        <h1> <Image avatar src='./assets/logo.jpeg' />ArtPoint</h1>
        <div className='navBar'>
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
          <input className='navSearch' type="text" placeholder="search" />
        </div>
        <div className='authLink'>
          {username === '' ? LoggedOutNav : LoggedInNav}
          {this.props.children}
        </div>
        <br />
        <Divider />
      </div>
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
