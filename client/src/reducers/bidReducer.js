const initialState = {
  bid: 0,
  sendingBid: false,
  error: null,
  bidErrored: false
};


const bidReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_BID':
      return {
        ...state,
        bid: action.bid
      };
    case 'SENDING_BID_TOGGLE':
      return {
        ...state,
        sendingBid: !state.sendingBid
      };
    case 'BID_ERRORED':
      return {
        ...state,
        sendingBid: false,
        error: action.error,
        bidErrored: true
      };
    default:
      return state;
  }
};

export default bidReducer;
