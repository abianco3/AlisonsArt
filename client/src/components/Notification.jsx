import React from 'react';
import { connect } from 'react-redux';
import * as notifications from '../actions/notificationActionCreator.jsx';
import Note from './NotificationEntry.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';
import Inbox from './Inbox.jsx';
import { Grid, Menu } from 'semantic-ui-react';

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      activeItem: 'All',
    };
    this.clickHandler=this.clickHandler.bind(this);
    this.menuSelector=this.menuSelector.bind(this);
  };

  componentWillMount() {
    const {dispatch, userId} = this.props;
    fetch(`/rehydrate`, {
      method: 'GET',
      headers: new Headers ({
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      })
    })
    .then(response => {
      if(!response.ok) {
        throw Error('authorization error');
      }

      if (response.headers.get('x-username') && response.headers.get('x-userId')) {
        dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId'), response.headers.get('x-type') === 'artist'));
      }

      dispatch(notifications.fetchNotifications(true));
      let userId = response.headers.get('x-userId');
      fetch(`/notifications/${userId}`, {
        method: 'GET',
        headers: new Headers({
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        })
      })
      .then(response => {
        if(!response.ok) {
          throw Error(response.statusText);
        }
        console.log('hererererer');
        if (response.headers.get('x-username') && response.headers.get('x-userId')) {
          dispatch(UserActions.logInSuccess(response.headers.get('x-username'), response.headers.get('x-userId')));
        }
        dispatch(notifications.fetchNotifications(false));
        dispatch(notifications.fetchError(false));
        return response.json();
      })
      .then(data => {
        dispatch(notifications.fetchSuccess(data));
        const {notification} = this.props
        this.setState({noties: notification.notifications});
      })
      .catch(() => dispatch(notifications.fetchError(true)));
    })
    .catch(err => {
      alert(err.message);
    });
  }

  clickHandler(notificationId, notificationObj) {
    const {dispatch, userId, notification} = this.props;
    let notes = notification.notifications;
    let index = notes.indexOf(notificationObj);

    dispatch(notifications.fetchNotifications(true));
    fetch(`/notifications/${userId}`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }),
      body: JSON.stringify({ id: notificationId })
    })
    .then(data => {
      let newNotification = notes.slice(0, index).concat([{...notes[index], 'read': true}]).concat(notes.slice(index + 1));
      dispatch(notifications.updater(newNotification));
      dispatch(notifications.fetchNotifications(false));
      dispatch(notifications.fetchError(false));
    })
    .catch(() => dispatch(notifications.fetchError(true)));
  };

  menuSelector(event) {
    this.setState({
      activeItem: event.target.text,
    });
  }

  render() {
    let { notification } = this.props;
    let newNotification = notification.notifications;
    let filteredNoties;
    if (this.state.activeItem === 'All') {
      filteredNoties = newNotification
    } else if (this.state.activeItem === 'Bids') {
      filteredNoties = newNotification.filter((noty) => {
        return noty.type === 'outbid';
      });
    } else if (this.state.activeItem === 'Read') {
      filteredNoties = newNotification.filter((noty) => {
        return noty.read === true;
      });
    } else if (this.state.activeItem === 'Unread') {
      filteredNoties = newNotification.filter((noty) => {
        if (noty.hasOwnProperty('read')) {
          return noty.read === false;
        } else {
          return true;
        }
      });
    } else {
      filteredNoties = newNotification.filter((noty) => {
        return noty.type === 'auction';
      });
    }
    let depiction = 'loading';
    if (notification.notifications.length > 0) {
      depiction = filteredNoties.length > 0 ? (filteredNoties.map((noty, index) => {
                    return (<Note key={noty.id + 'all'}
                      index={index}
                      clickHandler={this.clickHandler}
                      noty={noty} />)
                    })) : 'No Notifications';
    }
    return (
      <div>
        <Grid celled='internally' centered={true}>
          <Grid.Row>
            <Grid.Column width={4} className='menuheight'>
                <h1>Notifications</h1>
                <Menu pointing secondary vertical>
                  <Menu.Item name='All' active={this.state.activeItem === 'All'} onClick={(e) => this.menuSelector(e)} />
                  <Menu.Item name='Auctions' active={this.state.activeItem === 'Auctions'} onClick={(e) => this.menuSelector(e)} />
                  <Menu.Item name='Bids' active={this.state.activeItem === 'Bids'} onClick={(e) => this.menuSelector(e)} />
                  <Menu.Item name='Unread' active={this.state.activeItem === 'Unread'} onClick={(e) => this.menuSelector(e)} />
                  <Menu.Item name='Read' active={this.state.activeItem === 'Read'} onClick={(e) => this.menuSelector(e)} />
                </Menu>
            </Grid.Column>
            <Grid.Column width={12} className='shadowless borderleft'>
              <Grid celled='internally' centered={true} className='scrollable'>
                {depiction}
              </Grid>
              
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Inbox />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { 
    notification: state.notifications,
    userId: state.user.userId
  };
};

export default connect(mapStateToProps)(Notification);
