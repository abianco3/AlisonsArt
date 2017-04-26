import React, { Component } from 'react';
import { Container, Image, Grid } from 'semantic-ui-react';
import StripeCheckout from 'react-stripe-checkout';

const ClosedAuction = ({ auction, history }) => {
  const onToken = (token, auction) => {
    const data = {};
    data.token = token;
    data.auction = auction;

    fetch('/stripe/charge', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
      }),
      body: JSON.stringify(data)
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          return response.text()
          .then(err => {
            return Error(err);
          });
        } else {
          throw Error();
        }
      } else {
        return response.json();
      }
    })
    .then(data => {
      alert(data.message);
    })
    .catch(err => {
      alert(err);
    });
  };

  const handleClick = (id) => {
    history.push(`/auction/${id}`);
  };

  let message;
  if (auction.won) {
    message = (
      <StripeCheckout
        token={(token) => { onToken(token, auction); }}
        stripeKey="pk_test_OPzkCFtDFdvkqzZP2RCkuNDA"
      />
    );
  } else {
    message = <button>More by this Artist</button>;
  }
  return (
    <Grid.Column>
      <Image
        className="imageLink"
        src={auction.image_url}
        onClick={() => handleClick(auction.id)}
      />
      <Container>
        <h4 className>{auction.art_name}</h4>
        <p>{auction.first_name} {auction.last_name} ({auction.age})</p>
        <p>Closing Price ($USD): {auction.current_bid}</p>
        {message}
      </Container>
    </Grid.Column>
  );
};

export default ClosedAuction;