const initialState = {
  isFetching: false,
  fetchedOngoingAuctions: [],
  fetchedPassedAuctions: [],
  fetchedFeaturedArts: [],
  hasErrored: false,
  fetchAuctionsError: null
};

const auctionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_AUCTION_ERROR':
      return {
        ...state,
        fetchAuctionsError: 'fetching auction error!',
        hasErrored: true
      };
    case 'FETCHING_AUCTION':
      return {
        ...state,
        isFetching: action.isFetching
      };
    case 'ONGOING_AUCTIONS_FETCHED':
      return {
        ...state,
        fetchedOngoingAuctions: action.ongoingAuctions
      };
    case 'PASSED_AUCTIONS_FETCHED':
      return {
        ...state,
        fetchedPassedAuctions: action.passedAuctions
      };
    case 'FEATURED_ARTS_FETCHED':
      return {
        ...state,
        fetchedFeaturedArts: action.featuredArts
      };
    default:
      return state;
  }
};

export default auctionsReducer;
