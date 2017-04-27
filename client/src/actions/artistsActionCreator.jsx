export function fetchedArtistsSuccess(artists) {
  return {
    type: 'FETCHED_ARTISTS',
    artists: artists
  };
}

export function fetchArtistsError(bool, error) {
  return {
    type: 'FETCH_ARTISTS_ERROR',
    fetchArtistsErrored: bool,
    fetchArtistsError: error
  };
}

export function fetchingArtists(bool) {
  return {
    type: 'FETCHING_ARTISTS',
    isFetching: bool
  };
}

