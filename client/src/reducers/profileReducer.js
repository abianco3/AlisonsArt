const initialState = {
  postingProfile: false,
  hasErrored: false,
  error: null,
  success: false
};

const profileReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'POSTING_PROFILE':
      return {
        ...state,
        postingProfile: action.isPosting
      };
    case 'POSTING_ERRORED':
      return {
        ...state,
        hasErrored: action.hasErrored,
        error: action.error || null
      };
    case 'POSTING_SUCCESS':
      return {
        ...state,
        success: action.success
      };
    default:
      return state;
  }
 };
 
 export default profileReducer;
  