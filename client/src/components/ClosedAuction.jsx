import React from 'react';
import { Container, Image, Grid, Button } from 'semantic-ui-react';
import Moment from 'moment';

const ClosedAuction = ({ auction, handleSave, handleUnsave, user, flag, clickArtist }) => {

  let endTime = new Moment(auction.end_date).format('MMMM Do, YYYY, h:mm:ss a');
  return (
    <Grid>
      <Grid.Column width={12}>
        <Image fluid src={auction.artwork.image_url} />
      </Grid.Column>
      <Grid.Column width={4}>
        <Container>
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
          <p><strong>Closing Price (USD):</strong> ${auction.current_bid}</p>
        </Container>
      </Grid.Column>
    </Grid>
  );
};

export default ClosedAuction;
