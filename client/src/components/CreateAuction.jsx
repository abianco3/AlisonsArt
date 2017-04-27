import React from 'react';
import { connect } from 'react-redux';
import { Form, Image, Container, Divider, Grid, Button, Message } from 'semantic-ui-react';
import * as UserActions from '../actions/userActionCreator.jsx';

class CreateAuction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image_url: '',
      preview_image: 'https://www.mountaineers.org/images/placeholder-images/placeholder-400-x-400/image_preview',
      art_name: '',
      age: '',
      description: '',
      length: 0,
      height: 0,
      width: 0,
      categories: [],
      estimated_price: '',
      buyout_price: '',
      start_date: '',
      end_date: '',
      username: this.props.username,
      userId: this.props.userId,
      isError: false,
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleImageInput = this.handleImageInput.bind(this);
    this.handleImageCreate = this.handleImageCreate.bind(this);
  }

  componentWillMount() {
    let { dispatch } = this.props;
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

      if (!(response.headers.get('x-username') && response.headers.get('x-userId'))) {
        this.props.history.push('/login');
      }
    })
    .catch(err => {
      alert(err.message);
    });
  }

  handleInputChange(e) {
    const { history } = this.props; 
    if (!this.state.userId) {
      alert('you are not logged in, please sign up or log in');
      history.push('/login');
    }
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    })
  }

  handleCategoryChange(e) {
    const name = e.target.value
    let clone = this.state.categories.slice();
    if (clone.indexOf(name) === -1) {
      clone.push(name);
    } else {
      clone.splice(clone.indexOf(name), 1);
    }
    this.setState({
      categories: clone
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    const { history } = this.props;
    let artwork = {
      artist_id: Number(this.state.userId),
      age: this.state.age,
      estimated_price: Number(this.state.estimated_price),
      art_name: this.state.art_name,
      description: this.state.description,
      dimensions: `${this.state.length} x ${this.state.height} x ${this.state.width}`,
      image_url: this.state.image_url,  
    }
    let auction = {
      owner_id: Number(this.state.userId),
      estimated_price: Number(this.state.estimated_price),
      start_date: this.state.start_date,
      end_date: this.state.end_date,
      start_price: Number(this.state.estimated_price),
      buyout_price: Number(this.state.buyout_price),
      current_bid: null,
      current_bid_id: null,
      artwork: artwork,
    }
    if (!this.state.image_url 
      || !this.state.art_name 
      || !this.state.age 
      || !this.state.estimated_price 
      || !this.state.buyout_price 
      || !this.state.start_date 
      || !this.state.end_date) {
      this.setState({
        isError: true
      })
    } 
    else {
      return fetch(`/auctions`, {
        method: 'POST',
        headers: new Headers ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }),
        body: JSON.stringify(auction)
      })
      .then((response) => {
        if (!response.ok) {
          throw Error('creating auction failed!');
        }
        return response.json();
      })
      .then((data) => {
        history.push('/auctions/');
      })
      .catch((error) => {
        console.log('auction failed to create: ', error);
        this.setState({
          isError: true
        })
      })
    }

  }

  handleImageInput(e) {
    this.setState({
      image_url: e.target.value
    })
  }

  handleImageCreate() {
    this.setState({
      preview_image: 'http://www.theodo.fr/uploads/blog//2015/12/spinner.gif'
    })
    var formData = new FormData();
    formData.append('image_file', document.getElementById('imageToSend').files[0]);
    fetch(`/images`, {
        method: 'POST',
        body: formData,
        headers:  new Headers({
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
        })
    })
    .then((data) => {
      if (!data.ok) {
        throw Error(data.responseText);
      } else {
        return data.json();
      }
    })
    .then((response) => {
      this.setState({
        image_url: response.url,
        preview_image: response.url
      })
    })
    .catch((error) => {
      console.log('Uploading image failed! ', error);
    })
  }
  
  render() {
    return (
      <Container>
        <Form error={!!this.state.isError}>
          <Form.Group widths='equal'>
            <Form.Input 
              label='Piece name'
              name='art_name' 
              placeholder='ex: Starry Night'
              onChange={this.handleInputChange}
              value={this.state.art_name}
              required
            />
            <Form.Input
              label='Year'
              name='age' 
              type='number'
              placeholder='ex: 1911'
              onChange={this.handleInputChange}
              value={this.state.age}
              required
            />
          </Form.Group>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Image src={this.state.preview_image} size='large'/>
              </Grid.Column>
              <Grid.Column width={8}>
                <h5>Upload Image...</h5>
                <input 
                  type='file' 
                  name='image' 
                  accept='image/*' 
                  id='imageToSend'
                  onChange={this.handleImageCreate}
                />
                <Form.TextArea 
                  label='Description'
                  name='description'
                  placeholder='Tell us about your piece...'
                  onChange={this.handleInputChange}
                  value={this.state.description}
                />
                <Form.Group>
                  <Form.Input 
                    label='Length'
                    type='number'
                    name='length'
                    placeholder='inches'
                    onChange={this.handleInputChange}
                    value={this.state.length}
                  />
                  <Form.Input 
                    label='Width'
                    type='number'
                    name='width'
                    placeholder='inches'
                    onChange={this.handleInputChange}
                    value={this.state.width}
                  />
                  <Form.Input 
                    label='Height'
                    type='number'
                    name='height'
                    placeholder='inches'
                    onChange={this.handleInputChange}
                    value={this.state.height}
                  />
                </Form.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Form.Group widths='equal'>
            <Form.Input 
              label='Estimated value'
              type='number'
              name='estimated_price' 
              placeholder='USD'
              onChange={this.handleInputChange} 
              value={this.state.estimated_price}
              required
            />
            <Form.Input 
              label='Buyout price'
              type='number'
              name='buyout_price'
              placeholder='USD' 
              onChange={this.handleInputChange} 
              value={this.state.buyout_price}
              required
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input 
              label='Start date'
              type='datetime-local'
              name='start_date'
              onChange={this.handleInputChange} 
              value={this.state.start_date}
              required
            />
            <Form.Input 
              label='End date'
              type='datetime-local'
              name='end_date'
              onChange={this.handleInputChange} 
              value={this.state.end_date}
              required
            />
          </Form.Group>
          <Message
            error
            header='Missing Required Fields'
            content='Please fill out all required fields.'
          />
          <Button onClick={(e) => this.handleSubmit(e)}>Submit Auction</Button>
        </Form>
        <Divider />
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.user.username,
    userId: state.user.userId,
    profile: state.profile
  };
};

export default connect(mapStateToProps)(CreateAuction);
