import React, { Component } from 'react';
import { Container, Grid, Button } from 'semantic-ui-react';
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
      <p>
        <StripeCheckout
          token={(token) => { onToken(token, auction); }}
          stripeKey="pk_test_OPzkCFtDFdvkqzZP2RCkuNDA"
        />
      </p>
    );
  } else {
    message = <Button color="green">More by this Artist</Button>;
  }

  const _formatMoney = (money) => {
    return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Grid.Column>
      <div
        className="imageLink thumbnails"
        style={{backgroundImage: `url(${auction.image_url})`}}
        onClick={() => handleClick(auction.id)}
      />
      <div className="stripeButtonContainer">
        <h4 className="artName">{auction.art_name}</h4>
        <span>{auction.first_name} {auction.last_name} ({auction.age})</span>
        <br />
        <span>Closing Price: ${_formatMoney(+auction.current_bid)}</span>
        <br />
        {message}
      </div>
    </Grid.Column>
  );
};

export default ClosedAuction;
