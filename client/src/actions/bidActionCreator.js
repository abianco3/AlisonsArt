export function setBid(bid) {
  return {
    type: 'SET_BID',
    bid: bid
  };
}

export function toggleSend() {
  return {
    type: 'SENDING_BID_TOGGLE'
  };
}

export function error(error) {
  return {
    type: 'BID_ERRORED',
    error: error
  };
}

export function success() {
  return {
    type: 'BID_SUCCESS'
  };
}

export function reset() {
  return {
    type: 'RESET'
  };
}
