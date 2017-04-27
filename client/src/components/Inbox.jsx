import React from 'react';
import { connect } from 'react-redux';
import { Segment, Grid } from 'semantic-ui-react';
import * as ChatActions from './../actions/chatActionCreator.jsx';

class Inbox extends React.Component {
  constructor(props) {
    super(props);
    this.getInbox = this.getInbox.bind(this);
    this.renderChatRoom = this.renderChatRoom.bind(this);
  }

  getInbox() {
    fetch(`/messages/inbox/${this.props.userId}/?username=${this.props.username}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
      })
    })
    .then((response) => {
      if (!response.ok) {
        throw Error('failed to retrieve inbox messages...')
      }
      return response.json()
    })
    .then((data) => {
      let filteredInbox = {};
      for (var i = 0; i < data.length; i++) {
        var userId = this.props.userId;
        var senderId = data[i].sender_id;
        var receiverId = data[i].receiver_id;
        if (userId !== senderId && !filteredInbox[senderId]) {
          filteredInbox[senderId] = data[i];
        } else if (userId !== receiverId && !filteredInbox[receiverId]) {
          filteredInbox[receiverId] = data[i];
        }
      }
      var filteredArray = [];
      for (var key in filteredInbox) {
        filteredArray.push(filteredInbox[key]);
      }
      let { dispatch } = this.props;
      dispatch(ChatActions.getInbox(filteredArray));
    })
    .catch((error) => {
      console.log('getInbox FAILED! error: ', error);
    })
  }

  renderChatRoom(receiverId, fullName) {
    let roomname;
    if (this.props.userId > receiverId) {
      roomname = this.props.userId + receiverId;
    } else {
      roomname = receiverId + this.props.userId;
    }
    fetch(`/messages/${this.props.userId}/?receiver_id=${receiverId}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
      })
    })
    .then((response) => {
      if (!response.ok) {
        throw Error('failed to retrieve messages...')
      }
      return response.json();
    })
    .then((data) => {
      let { dispatch } = this.props;
      dispatch(ChatActions.initRoom(receiverId, data, roomname, fullName));
    })
    .catch((error) => {
      console.log('retrieveMessages failed! error: ', error);
    })
  }

  componentWillMount() {
    setTimeout(this.getInbox, 1500);
  }

  render() {
    return (
      <Segment className='inboxContainer'>
        <h3>INBOX</h3>
          {
            this.props.inboxMessages.map(conversation => {
              let splitDate = conversation.message_date.split('T')[0].split('-');
              let months = {
                '01': 'January',
                '02': 'February',
                '03': 'March',
                '04': 'April',
                '05': 'May',
                '06': 'June',
                '07': 'July',
                '08': 'August',
                '09': 'September',
                '10': 'October',
                '11': 'November',
                '12': 'December',
              }
              let properDate = months[splitDate[1]] + ' ' + splitDate[2] + ', ' + splitDate[0];
              let fullName = conversation.first_name + ' ' + conversation.last_name;
              let senderId = conversation.sender_id;
              let receiverId = conversation.receiver_id;
              if (this.props.userId !== conversation.sender_id) {
                return (
                  <Segment
                   className='inboxLink'
                   value={conversation.sender_id} 
                   name={fullName} 
                   onClick={() => this.renderChatRoom(senderId, fullName)}
                  >
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={3}>
                          <strong>{conversation.first_name} {conversation.last_name} </strong>
                        </Grid.Column>
                        <Grid.Column style={{'overflow': 'hidden'}}width={10}>
                          "{conversation.text}"
                        </Grid.Column>
                        <Grid.Column width={3}>
                          <strong>{properDate}</strong>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Segment>
                )
              } else {
                return (
                  <Segment
                    className='inboxLink'
                    value={conversation.receiver_id} 
                    name={fullName} 
                    onClick={() => this.renderChatRoom(receiverId, fullName)}
                  >
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={3}>
                          <strong>{conversation.first_name} {conversation.last_name} </strong>
                        </Grid.Column> 
                        <Grid.Column style={{'overflow': 'hidden'}} width={10}>
                          "{conversation.text}"
                        </Grid.Column> 
                        <Grid.Column width={3}>
                          <strong>{properDate}</strong>
                        </Grid.Column> 
                      </Grid.Row>
                    </Grid>
                  </Segment>
                )
              }
            })
          }
      </Segment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userId: state.user.userId,
    username: state.user.username,
    inboxMessages: state.chat.inboxMessages,
  }
}

export default connect(mapStateToProps)(Inbox)
