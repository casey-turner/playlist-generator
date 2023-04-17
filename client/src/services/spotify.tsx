import axios from 'axios'

const LOCALSTORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  expireTime: 'expire_time',
  timestamp: 'timestamp',
};

const LOCALSTORAGE_VALUES: LocalStorageValues = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

/**
 * Clears the local storage and redirects to the home page.
 */
const logout = (): void => {
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }

  window.location = window.location.origin;
};

/**
 * Makes a call to the refresh_token endpoint to get a new access token and updates the local storage with the new values.
 * @returns True if the access token was successfully refreshed, false otherwise.
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    if (!LOCALSTORAGE_VALUES.refreshToken || LOCALSTORAGE_VALUES.refreshToken === 'undefined') {
      console.log('No refresh token found');
      logout();
      return false;
    }

    const response = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);
    const { access_token, expires_in } = response.data;

    // Update the local storage with the new access token and expiration time
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.expireTime, expires_in);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());

    // Reload the page to apply the changes
    window.location.reload();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Checks if the current time is greater than the expire time of the access token.
 * @returns True if the access token is expired, false otherwise.
 */
const isAccessTokenExpired = (): boolean => {
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.timestamp) {
    const currentTime = Date.now();
    const expireTime = Number(LOCALSTORAGE_VALUES.timestamp) + Number(LOCALSTORAGE_VALUES.expireTime);

    return currentTime > expireTime;
  }
  return false;
};

/**
 * Gets the access token from the local storage or from the query params if it's not in the local storage.
 * @returns The access token or false if there is no access token.
 */
const getSpotifyAccessToken = (): string | false => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryParams: Record<string, string | null> = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
    [LOCALSTORAGE_KEYS.timestamp]: Date.now().toString(),
  };

  const hasError = urlParams.get('error');
  if (hasError || isAccessTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshAccessToken();
  }

  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

    if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    for (const property in queryParams) {
        const value = queryParams[property];
        if (value !== null) { 
        window.localStorage.setItem(property, value);
        }
    }
    return queryParams[LOCALSTORAGE_KEYS.accessToken]!;
    }

  return false; 
};


export { logout, getSpotifyAccessToken, spotifyApi };

const spotifyApi = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: { 'Authorization': `Bearer ${getSpotifyAccessToken()}`, 'Content-Type': 'application/json'  },
    // headers['Authorization']: `Bearer ${getSpotifyAccessToken()}`,
    // headers['Content-Type']: 'application/json'
});

/** 
* Gets the user's profile information. 
* @returns {Promise} The user's profile information. 
*/
export const getUserProfile = () => spotifyApi.get('/me');