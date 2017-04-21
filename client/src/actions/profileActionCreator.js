export function postingProfile(bool) {
  return {
    type: 'POSTING_PROFILE',
    postingProfile: bool
  };
}

export function postingErrored(bool, error) {
  return {
    type: 'POSTING-ERRORED',
    hasErrored: bool,
    error: error
  };
}

export function postingSuccess(bool) {
  return {
    type: 'POSTING_SUCCESS',
    success: bool
  };
}