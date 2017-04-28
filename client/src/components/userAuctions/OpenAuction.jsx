import React, { Component } from 'react';
import { Container, Grid, Button } from 'semantic-ui-react';

const OpenAuction = ({auction, history}) => {
  let message;

  const handleClick = (id) => {
    history.push(`/auction/${id}`);
  };

  const _formatMoney = (money) => {
    return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (auction.isHighestBidder) {
    message = <Button onClick={() => handleClick(auction.id)}>You're Winning!</Button>;
  } else {
    message = <Button color="green" onClick={() => handleClick(auction.id)}>You've Been Outbid!</Button>;
  }
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
        <span>Current Bid: ${_formatMoney(+auction.current_bid)}</span>
        <br />
        {message}
      </div>
    </Grid.Column>
  );
};

export default OpenAuction;
