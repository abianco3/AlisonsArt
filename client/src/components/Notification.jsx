import React from 'react';
import { connect } from 'react-redux';
import * as notifications from '../actions/notificationActionCreator.jsx';
import Note from './NotificationEntry.jsx';
import * as UserActions from '../actions/userActionCreator.jsx';

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.clickHandler =this.clickHandler.bind(this);
  };

  componentWillMount() {
    const {dispatch, userId} = this.props;

    fetch('/notifications', {
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

      dispatch(notifications.fetchNotifications(true));
      let userId = response.headers.get('x-userId');
      fetch(`/notifications/${userId}`, {
        method: 'GET',
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
      })
      .catch(() => dispatch(notifications.fetchError(true)));
    })
    .catch(err => {
      alert(err.message);
    });
  }

  clickHandler(notificationId, index) {
    const {dispatch, userId, notification} = this.props;
    let notes = notification.notifications;

    let newNotification = notes.slice(0, index).concat([{...notes[index], 'read': true}]).concat(notes.slice(index + 1));
    dispatch(notifications.updater(newNotification));

    dispatch(notifications.fetchNotifications(true));
    fetch(`/notifications/${userId}`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }),
      body: JSON.stringify({ id: notificationId })
    })
    .then(data => {
      dispatch(notifications.fetchNotifications(false));
      dispatch(notifications.fetchError(false));
    })
    .catch(() => dispatch(notifications.fetchError(true)));
  };

  render() {
    const { notification } = this.props;
    return (
      <div>
        <div>
          <p>Notifications~~~</p>
        </div>
        <div>
          {notification.notifications.map((notification, index) => (
            <Note key={notification.id}
            index={index}
            clickHandler={this.clickHandler}
            notification={notification} />)
          )}
        </div>
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
