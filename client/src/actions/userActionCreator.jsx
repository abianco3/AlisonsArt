export function logInSuccess(username, userId, type) {
  return {
    type: 'LOG_IN_COMPLETE',
    username: username,
    userId: userId,
    type: type
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

