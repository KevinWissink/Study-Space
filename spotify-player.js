// Will hold the Player Object.
let spotifyPlayer = null;
let spotifyPlayerID = null;

// Names of the stored variables in localStorage.
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

// Domains for our the backend and the frontend.
const DOMAIN_BACK_END = "https://study-space-tamu.herokuapp.com";

// Takes as parameter a URL and returns a JSON of the extracted query parameters.
function queryURLToJSON(string) {
    return JSON.parse('{"' + decodeURI(string.split('?')[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
}

// Clears the access and refresh tokens from localStorage and redirects back to landing page.
function spotifyLogout() {
    // Wipe localStorage values.
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);

    // Redirect to landing page.
    window.location.replace("./index.html");
}

/**
 * Once the Playback SDK is ready, this method will execute.
 */
window.onSpotifyWebPlaybackSDKReady = () => {
    // Parse the query parameters from the URL.
    let queryData = queryURLToJSON(window.location.href);

    // Store the parsed access and refresh tokens in localStorage.
    localStorage.setItem(ACCESS_TOKEN, queryData.access_token);
    localStorage.setItem(REFRESH_TOKEN, queryData.refresh_token);

    // Create the Spotify Player Object.
    spotifyPlayer = new Spotify.Player({
      name: "Study Space",
      getOAuthToken: callback => { callback(localStorage.getItem(ACCESS_TOKEN)); }
    });

    // Connect the Spotify Player.
    spotifyPlayer.connect().then(success => {
        if (success) {
            console.log("Spotify Player connected!");
        }
    });
    
    // Error handling
    spotifyPlayer.addListener("initialization_error", ({ message }) => { console.error(message); });
    spotifyPlayer.addListener("authentication_error", ({ message }) => { console.error(message); });
    spotifyPlayer.addListener("account_error", ({ message }) => { console.error(message); });
    spotifyPlayer.addListener("playback_error", ({ message }) => { console.error(message); });
    
    // Playback status updates
    spotifyPlayer.addListener("player_state_changed", state => { console.log(state); });
    
    // Ready
    spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        spotifyPlayerID = device_id;
    });
  
    // Not Ready
    spotifyPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });
};

// Pause/play the current track being played.
function playbackToggle() {
    spotifyPlayer.togglePlay().then(() => {
        console.log("Toggled!");
    });
}

// Skips to previous song in the queue.
function playbackPrevious() {
    spotifyPlayer.previousTrack().then(() => {
        console.log("Previous!");
    });
}

// Skips to next song in the queue.
function playbackNext() {
    spotifyPlayer.nextTrack().then(() => {
        console.log("Next!");
    });
}

// Starts playing a preset playlist on through the Spotify Player Object.
function spotifyPlay() {
    // Query parameters.
    const playEndpoint = "https://api.spotify.com/v1/me/player/play";
    const device_id = spotifyPlayerID;

    // Build the request URI.
    const playQuery = playEndpoint +
            "?device_id=" + encodeURIComponent(device_id);

    // PUT request body parameters.
    const body = JSON.stringify({
        context_uri: "spotify:playlist:37i9dQZEVXbMDoHDwVN2tF"
    });

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", playQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.status == 204) {
            console.log("Playing!");
        }
    }
    xmlHTTP.send(body);
}

/**
 * In order to refresh our access token, we must make a POST request to Spotify from our backend
 * since it involves sending our client ID and secret.
 * Therefore, this function makes a HTTP request to our backend which then executes a POST request to
 * Spotify. Upon getting the response, the backend simply returns the response from Spotify as a response
 * to our HTTP request in this function. The response will contain a newly refreshed access token and possibly
 * a new refresh token which we then store in localStorage.
 */
function spotifyRefresh() {
    // Query parameters for making a request to the backend server.
    const refreshEndpoint = DOMAIN_BACK_END + "/spotify/refresh/";
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    // Build the request URI.
    const refreshQuery = refreshEndpoint + 
            "?refresh_token=" + encodeURIComponent(refreshToken);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", refreshQuery, true);
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 200) {
            // Upon receiving a response, store the new access token.
            let response = JSON.parse(xmlHTTP.responseText);
            console.log(response);
            localStorage.setItem(ACCESS_TOKEN, response.access_token);

            // Sometimes we will also get a new refresh token from Spotify, if so store the new refresh token.
            if (response.hasOwnProperty("refresh_token")) {
                localStorage.setItem(REFRESH_TOKEN, response.refresh_token);
            }
        }
    }
    xmlHTTP.send();
}
