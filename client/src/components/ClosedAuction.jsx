import React from 'react';
import { Container, Image, Grid, Button } from 'semantic-ui-react';
import Moment from 'moment';

const ClosedAuction = ({ auction, handleSave, handleUnsave, user, flag, clickArtist }) => {

  let endTime = new Moment(auction.end_date).format('MMMM Do, YYYY, h:mm:ss a');

  const _formatMoney = (money) => {
    return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Grid>
      <Grid.Column width={8}>
        <Image 
          className="auctionImage"
          src={auction.artwork.image_url} />
      </Grid.Column>
      <Grid.Column width={8}>
        <div className="auctionDescription">
          <h2 className='closedListing'>This auction ended: {endTime}</h2>
          {user.username && !flag ? <Button circular icon="heart" content="save" color="green" onClick={() =>{
            handleSave(auction.id)
          }} /> : null}
          {user.username && flag ?  <Button circular icon="empty heart" content="unsave" onClick={() => {
            handleUnsave(auction.id)
          }}/> : null}
          <h2>{auction.artwork.art_name}</h2>
          <h3><a onClick={clickArtist}>{auction.first_name} {auction.last_name} ({auction.artwork.age})</a></h3>
          <p><strong>Description:</strong> {auction.artwork.description}</p>
          <p><strong>Closing Price (USD):</strong> ${_formatMoney(+auction.current_bid)}</p>
        </div>
      </Grid.Column>
    </Grid>
  );
};

export default ClosedAuction;
