import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Segment, Button, TextArea, Form } from 'semantic-ui-react';
import * as ChatActions from './../actions/chatActionCreator.jsx';

class WriteMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    }
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.closeChat = this.closeChat.bind(this);
    this.toggleMinimize = this.toggleMinimize.bind(this);
  }

  handleFormChange(e) {
    this.setState({
      text: e.target.value
    })
  }

  handleFormSubmit(e) {
    e.preventDefault();
    var messagePayload = {
      text: this.state.text,
      sender_id: this.props.userId,
      receiver_id: this.props.receiverId,
      roomname: this.props.roomname,
    }
    this.setState({
      text: '',
    })
    fetch(`/messages/`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(messagePayload)
    })
    .then((response) => {
      if (!response.ok) {
        throw Error('message failed to send...');
      }
      return response.json();
    })
    .then((data) => {
      let {dispatch} = this.props;
      dispatch(ChatActions.chatMessage(messagePayload));
    })
    .catch((error) => {
      console.log('handleFormSubmit failed! Error: ', error);
    });
  }

  closeChat() {
    let { dispatch } = this.props;
    dispatch(ChatActions.clearChat());
  }

  scrollToBottom() {
    const node = ReactDOM.findDOMNode(this.messagesEnd);
    node.scrollIntoView({behavior: "smooth"});
  }

  toggleMinimize() {
    let { dispatch } = this.props;
    dispatch(ChatActions.minimizeWindow());
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    if (!this.props.roomname || !this.props.receiverId) {
      return (
        <div className='hiddenWindow'>
          <div className='fakeDiv' ref={(el) => {this.messagesEnd = el;}}></div>
        </div>
      )
    } else if (!this.props.minimized) {
      return (
        <Segment className='messageWindow'>
          <p className='chatTopBar' onClick={this.toggleMinimize}><strong>{this.props.receiverName}</strong></p>
          <p className='closeChatButton' onClick={this.closeChat}>X</p>
          <Segment className='messageFeed'>
            {
              this.props.messages.map(message => {
                if (Number(message.sender_id) === Number(this.props.userId)) {
                  return (
                    <p className='senderMessage'>{message.text}</p>
                  )
                } else {
                  return (
                    <p className='receiverMessage'>{message.text}</p>
                  )
                }
              })
            }
            <div className='fakeDiv' ref={(el) => {this.messagesEnd = el;}}></div>
          </Segment>
          <Form className='messageInput'>  
            <Form.Field>
              <input value={this.state.text} onChange={this.handleFormChange}/>
            </Form.Field>
            <Button style={{'display': 'none'}} type='submit' onClick={this.handleFormSubmit}>the button</Button>
          </Form>
        </Segment>
      )
    } else if (this.props.minimized) {
      return (
        <Segment className='miniChatBar' onClick={this.toggleMinimize}>
          <p><strong>{this.props.receiverName}</strong></p>
          <p className='closeChatButton' onClick={this.closeChat}>X</p>
          <div className='fakeDiv' ref={(el) => {this.messagesEnd = el;}}></div>
        </Segment>
      )
    }
  }
}
const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    userId: state.user.userId,
    receiverId: state.chat.receiverId,
    messages: state.chat.messages,
    roomname: state.chat.roomname,
    minimized: state.chat.minimized,
    receiverName: state.chat.receiverName,
  }
}

export default connect(mapStateToProps)(WriteMessage)

