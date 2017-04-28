export function fetchAuctionErrored(bool, error) {
  return {
    type: 'FETCH_AUCTION_ERROR',
    hasErrored: bool,
    fetchAuctionsError: error
  };
}

export function fetchingAuctions(bool) {
  return {
    type: 'FETCHING_AUCTION',
    isFetching: bool
  };
}

export function ongoingAuctionsFetchedSuccess(ongoingAuctions) {
  return {
    type: 'ONGOING_AUCTIONS_FETCHED',
    ongoingAuctions
  };
}

export function passedAuctionsFetchedSuccess(passedAuctions) {
  return {
    type: 'PASSED_AUCTIONS_FETCHED',
    passedAuctions
  };
}

export function featuredArtsFetchedSuccess(featuredArts) {
  return {
    type: 'FEATURED_ARTS_FETCHED',
    featuredArts
  };
}

export function fetchingAnAuction(bool) {
  return {
    type: 'FETCHING_AN_AUCTION',
    isFetchingAuction: bool
  };
}

export function fetchedAnAuction(auction) {
  return {
    type: 'FETCHED_AN_AUCTION',
    auction
  };
}

export function updateBid(bid) {
  return {
    type: 'UPDATE_CURRENT_BID',
    current_bid: bid.current_bid,
    current_bid_id: bid.current_bid_id
  };
}

//currently not in use:
export function fetchAuctionData(url) {
  return (dispatch) => {
    dispatch(fetchingAuction(true));

    fetch(url)
    .then((response) => {
      if(!reponse.ok) {
        throw Error(reponse.statusText);
      }
      dispatch(fetchingAuction(false));
      return response;
    })
    .then(response => response.json())
    .then(auctionData => dispatch(auctionFetchedSuccess(auctionData)))
    .catch((err) => dispatch(fetchAuctionErrored(true, err)));
  };
}
