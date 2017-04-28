import React from 'react';
import { Container, Image, Grid, Button, Form, Input, Message } from 'semantic-ui-react';
import Moment from 'moment';
import Messages from './Messages.jsx';

let inputNode = null;

const AuctionDetail = ({auction, bid, setBid, handleClick, user, handleSave, handleUnsave, flag, clickArtist}) => {

  let endTime = new Moment(auction.end_date).format('MMMM Do, YYYY, h:mm:ss a');
  let current = +auction.current_bid;
  let start = +auction.start_price;
  let buyout = +auction.buyout_price;

  let interval = 0;
  if (buyout < 5000) {
    interval = parseInt(0.1 * buyout);
  } else {
    interval = 1000;
  }

  const _formatMoney = (money) => {
    return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  };

  let avail = current ? Math.min(current + interval, buyout) : start;
  return (
    <Grid>
      <Grid.Column width={11}>
        <Image fluid src={auction.artwork.image_url} />
      </Grid.Column>
      <Grid.Column width={5}>
        <Container>
          <h2>{auction.artwork.art_name}</h2>
          {user.username && !flag ? <Button circular icon="heart" content="save" color="green" onClick={() =>{
            handleSave(auction.id)
          }} /> : null}
          {user.username && flag ? <Button circular icon="empty heart" content="unsave" onClick={() => {
            handleUnsave(auction.id)
          }} /> : null}
          <h3><a onClick={clickArtist}>{auction.first_name} {auction.last_name} ({auction.artwork.age})</a></h3>
          <p><strong>Auction Ends:</strong> {endTime}</p>
          <p><strong>Description:</strong> {auction.artwork.description}</p>
          <p><strong>Current Price (USD):</strong> ${_formatMoney (+(current || start))}</p>
          <p><strong>Buyout Price (USD):</strong> ${_formatMoney(+buyout)}</p>
          <Form.Group widths='equal'>
            <span>
              <p>
                <strong className="blue-text">
                  Next available bidding amount: {_formatMoney(+avail)}
                </strong>
              </p>
              <strong>
                Bid for: 
              </strong>
              <span className="ui input">
                <input onChange={e => {
                  if (isNaN(e.target.value)) {
                    e.target.value = '';
                  } else {
                    setBid(e.target.value);
                  }
                }} ref={node => {
                  inputNode = node
                }} />
              </span>
            </span>
            <Button className="ui right floated" color="green" onClick={() => {
              handleClick(auction.id, avail, buyout)
              inputNode.value = '';
            }}>Submit</Button>
          </Form.Group>
          <Messages />
        </Container>
      </Grid.Column>
    </Grid>
  );
};

export default AuctionDetail;

