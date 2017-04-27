import React, { Component } from 'react';
import { Image, Grid, Container } from 'semantic-ui-react';

class ContactUs extends Component {

  render() {
    return (
      <Container>
        <h1 className="contactHeader">Tenacious Turtles</h1>
        <Grid stackable>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Image
                src="assets/turtles.jpg"
              />
            </Grid.Column>
            <Grid.Column>
              <h4 className="imageHeader">Alison Zhang</h4>
              <a href="mailto:alisonzthu@gmail.com"><p>alisonzthu@gmail.com</p></a>
              <h4 className="imageHeader">Bryan Nguyen</h4>
              <a href="mailto:bryan.nguyen.a@gmail.com"><p>bryan.nguyen.a@gmail.com</p></a>
              <h4 className="imageHeader">Winston Ku</h4>
              <a href="mailto:wdku5791@gmail.com"><p>wdku5791@gmail.com</p></a>
              <h4 className="imageHeader">Anthony Bianco</h4>
              <a href="mailto:anthony.bianco3@gmail.com"><p>anthony.bianco3@gmail.com</p></a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContactUs;
