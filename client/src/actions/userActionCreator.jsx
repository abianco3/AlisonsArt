export function logInSuccess(username, userId, bool) {
  return {
    type: 'LOG_IN_COMPLETE',
    username: username,
    userId: userId,
    artist: bool
  };
}

export function checkingInfo(bool) {
  return {
    type: 'CHECKING_LOG_IN',
    checking: bool
  };
}

export function logOut() {
  return {
    type: 'LOG_OUT_COMPLETE'
  };
}

export function loginError(err) {
  return {
    type: 'LOG_IN_ERROR',
    error: err
  };
}

