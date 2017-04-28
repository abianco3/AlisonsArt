const initialState = {
  bid: 0,
  sendingBid: false,
  error: null,
  bidErrored: false,
  success: false
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
    case 'BID_SUCCESS':
      return {
        ...state,
        success: true,
        sendingBid: false
      };
    case 'RESET':
      return {
        initialState
      };
    default:
      return state;
  }
};

export default bidReducer;
