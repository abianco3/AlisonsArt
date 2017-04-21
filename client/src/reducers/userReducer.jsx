const initialState = {
  username: '',
  userId: null,
  type: null,
  checkingInfo: false,
  error: null,
  loggedOut: true
};

const userReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'CHECKING_LOG_IN':
      return {
        ...state,
        checkingInfo: action.checking,
        error: null
      };
    case 'LOG_IN_COMPLETE':
      return {
        ...state,
        username: action.username,
        userId: action.userId,
        loggedOut: false
      };
    case 'LOG_IN_ERROR':
      return {
        ...state,
        error: action.error,
      };
    case 'LOG_OUT_COMPLETE':
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
}

export default userReducer;
