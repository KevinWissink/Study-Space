// Variables for UI elements.
let playbackCoverImage = null;
let playbackTrackLabel = null;
let playbackArtistLabel = null;
let playbackDurationLabel = null;
let playbackShuffleButton = null;
let playbackRepeatButton = null;
let playbackPreviousButton = null;
let playbackToggleButton = null;
let playbackNextButton = null;

let userPlaylistsSelect = null;
let userPlaylistsButton = null;
let presetPlaylistsSelect = null;
let presetPlaylistsButton = null;

let scrubLine = null;
let scrub = null;

// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("study-break-button").addEventListener("click", () => {
        window.location.href = "./study-break.html";
    })

    document.getElementById("spotify-start-button").addEventListener("click", () => {
      spotifyPlay("spotify:playlist:37i9dQZEVXbMDoHDwVN2tF");  
    });    

    playbackCoverImage = document.getElementById("playback-cover-image");
    playbackTrackLabel = document.getElementById("playback-track-label");
    playbackArtistLabel = document.getElementById("playback-artist-label");
    playbackDurationLabel = document.getElementById("playback-duration-label");

    playbackShuffleButton = document.getElementById("playback-shuffle-button");
    playbackShuffleButton.addEventListener("click", playbackShuffle);

    playbackRepeatButton = document.getElementById("playback-repeat-button");
    playbackRepeatButton.addEventListener("click", playbackRepeat);

    playbackPreviousButton = document.getElementById("playback-previous-button");
    playbackPreviousButton.addEventListener("click", playbackPrevious);

    playbackToggleButton = document.getElementById("playback-toggle-button");
    playbackToggleButton.addEventListener("click", playbackToggle);    

    playbackNextButton = document.getElementById("playback-next-button");
    playbackNextButton.addEventListener("click", playbackNext);

    userPlaylistsSelect = document.getElementById("user-playlists-select");
    userPlaylistsButton = document.getElementById("user-playlists-button");
    userPlaylistsButton.addEventListener("click", () => {
        spotifyPlay(userPlaylistsSelect.value);
    })

    presetPlaylistsSelect = document.getElementById("preset-playlists-select");
    presetPlaylistsButton = document.getElementById("preset-playlists-button");
    presetPlaylistsButton.addEventListener("click", () => {
        spotifyPlay(presetPlaylistsSelect.value);
    })
    
    // Create the scrub object. Set the starting coordinates to 0.
    scrub = {
        el: document.getElementById("scrub"),
        current: {
            x: 0
        },
        last: {
            x: 0
        }
    }
    timeline = document.getElementById("timeline"),
    mouseDown = false;
    
    scrub.el.onmousedown = () => {
        mouseDown = true;
        scrub.origin = timeline.offsetLeft;
        scrub.last.x = scrub.el.offsetLeft;
        return false;
    };

    // Create the scrub line object. This is the line that follows the scrubber along the timeline.
    scrubLine = {
        el: document.getElementById("scrub-line"),
        current: {
            width: 0
        },
    }

    // Add the user's playlists to the drop down menu.
    spotifyPlaylists(updateUserPlaylistsUI);
});

/*--------------------------------------------------------------------------*/
/* SPOTIFY PLAYER OBJECT AND STATES */
/*--------------------------------------------------------------------------*/

// Will hold the Player Object.
let spotifyPlayer = null;
let spotifyPlayerID = null;

// The playback state, false for playing, true for paused.
let spotifyIsPausedState = false;
// The shuffle state of the player.
let spotifyShuffleState = false;
// The repeat state of the player. 0 is off, 1 is repeat context, 2 is repeat track.
let spotifyRepeatState = 0;
// The total time in ms of the current track playing.
let spotifyTrackTotalTime = 0;

/*--------------------------------------------------------------------------*/
/* SCRUB BAR VARIABLES */
/*--------------------------------------------------------------------------*/

// State if the scrubber has been clicked.
let scrubberClicked = false;

/*--------------------------------------------------------------------------*/
/* CONSTANTS */
/*--------------------------------------------------------------------------*/

// Names of the stored variables in localStorage.
const ACCESS_TOKEN = "spotify_access_token";
const REFRESH_TOKEN = "spotify_refresh_token";

// Domains for our the backend and the frontend.
const DOMAIN_BACKEND = "https://study-space-tamu.herokuapp.com";

/*--------------------------------------------------------------------------*/
/* SPOTIFY PLAYER */
/*--------------------------------------------------------------------------*/

/**
 * Once the Playback SDK is ready, this method will execute.
 */
window.onSpotifyWebPlaybackSDKReady = () => {
    // Create the Spotify Player Object.
    spotifyPlayer = new Spotify.Player({
      name: "Study Space Player",
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
    spotifyPlayer.addListener("player_state_changed", (state) => {
        // Holds the track JSON.
        let item = state.track_window.current_track;

        // The parameters to update the playback UI.
        let track = item.name;
        let artist = item.artists[0].name;
        // There can be multiple artists, if so comma seperate them.
        for (let i = 1; i < item.artists.length; i++) {
            artist += ", " + item.artists[i].name;
        }
        let trackTime = item.duration_ms;
        let coverURL = item.album.images[2].url;

        // If the player is paused (false) or playing (true).
        let isPaused = state.paused;

        // Update the playback UI.
        upadtePlaybackUI(track, artist, trackTime, coverURL, isPaused);

        // Global variable for paused state.
        spotifyIsPausedState = isPaused;
        // Update the shuffle state of the player.
        spotifyShuffleState = state.shuffle;
        // Set the global variable for total track time.
        spotifyTrackTotalTime = trackTime;
    });
    
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

    });
}

// Skips to next song in the queue.
function playbackNext() {
    spotifyPlayer.nextTrack().then(() => {

    });
}

/**
 * Seeks to a given position (ms) of the track.
 * @param {number} seekTo The time in ms to seek the playback to. 
 */
function playbackSeek(seekTo) {
    spotifyPlayer.seek(seekTo).then(() => {
        console.log("Seeked to (ms): " + seekTo + ", (s): " + seekTo / 1000);
    });
}

// Toggles shuffle for the playback.
function playbackShuffle() {
    const shuffleEndpoint = "https://api.spotify.com/v1/me/player/shuffle";
    const state = !spotifyShuffleState;

    const shuffleQuery = shuffleEndpoint + 
            "?state=" + encodeURIComponent(state);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", shuffleQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            // Upon success, toggle the local shuffle state.
            spotifyShuffleState = !spotifyShuffleState;
        }
    }
    xmlHTTP.send();
}

// Sets the repeat mode for the playback.
function playbackRepeat() {
    const repeatEndpoint = "https://api.spotify.com/v1/me/player/repeat";
    let state = null;
    // Here we up the current state, so if the user had off, change it to context.
    if (spotifyRepeatState == 0) {
        state = "context";
    } else if (spotifyRepeatState == 1) {
        state = "track";
    } else if (spotifyRepeatState == 2) {
        state = "off";
    }
    
    const repeatQuery = repeatEndpoint + 
            "?state=" + encodeURIComponent(state);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", repeatQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            spotifyRepeatState = (spotifyRepeatState + 1) % 3;
        }
    }
    xmlHTTP.send();
}

/**
 * Updates the playback UI after the playback state has been changed.
 * @param {string} track Title of the track being played. 
 * @param {string} artist Name of the artist. If multiple, each separated by a comma.
 * @param {number} trackTime The total time of the track in ms.
 * @param {string} coverURL The URL of the track cover art.
 * @param {boolean} isPaused True if the player is paused, false if the playback is playing.
 */
function upadtePlaybackUI(track, artist, trackTime, coverURL, isPaused) {
    playbackTrackLabel.innerHTML = track;
    playbackArtistLabel.innerHTML = artist;
    playbackDurationLabel.innerHTML = formatTime(trackTime / 1000);
    playbackCoverImage.src = coverURL;

    if (isPaused) {
        playbackToggleButton.innerHTML = "play_circle_outline";
    } else {
        playbackToggleButton.innerHTML = "pause_circle_outline";
    }
}

/**
 * Takes as parameter an array of the user's playlists, each of which is a playlist object.
 * Adds an option in the drop-down menu UI for each of the user's playlist. 
 * @param {array} playlists An array of JSON corresponding to the playlist object. 
 */
function updateUserPlaylistsUI(playlists) {
    // Iterate through all of the user's playlists.
    for (let i = 0; i < playlists.length; i++) {
        // Construct the drop-down option.
        let option = document.createElement("option");
        option.value = playlists[i].uri;
        option.text = playlists[i].name;
        // Append the drop-down option to the drop-down menu.
        userPlaylistsSelect.appendChild(option);
    }
}

/**
 * Makes an API call to return the user's playlists. This function also updates the UI by passing the reponse to the callback fucntion.
 * @param {function} callback A function that takes as parameter the array of user playlists. This function will update the UI.
 */
function spotifyPlaylists(callback) {
    // Query parameters.
    const playlistsEndpoint = "https://api.spotify.com/v1/me/playlists";

    // Build the request URI.
    const playlistsQuery = playlistsEndpoint;
            
    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", playlistsQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 200) {
            callback(JSON.parse(xmlHTTP.response).items);
        }
    }
    xmlHTTP.send();
}

/**
 * Start playing the given URI.
 * @param {string} uri The Spotify URI of the playlist/track/etc. to play. 
 */
function spotifyPlay(uri) {
    // Query parameters.
    const playEndpoint = "https://api.spotify.com/v1/me/player/play";
    const device_id = spotifyPlayerID;

    // Build the request URI.
    const playQuery = playEndpoint +
            "?device_id=" + encodeURIComponent(device_id);
            
    // PUT request body parameters.
    const body = JSON.stringify({
        context_uri: uri
    });

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", playQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Playing!");
        }
    }
    xmlHTTP.send(body);
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
 * In order to refresh our access token, we must make a POST request to Spotify from our backend
 * since it involves sending our client ID and secret.
 * Therefore, this function makes a HTTP request to our backend which then executes a POST request to
 * Spotify. Upon getting the response, the backend simply returns the response from Spotify as a response
 * to our HTTP request in this function. The response will contain a newly refreshed access token and possibly
 * a new refresh token which we then store in localStorage.
 */
function spotifyRefresh() {
    // Query parameters for making a request to the backend server.
    const refreshEndpoint = DOMAIN_BACKEND + "/api/spotify/refresh/";
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

/*--------------------------------------------------------------------------*/
/* SCRUB BAR */
/*--------------------------------------------------------------------------*/

// Upon clicking the mouse on the scrubber.
document.onmousemove = (e) => {
    if (mouseDown == true) {
        // The scubber itself has been clicked on, change the state.
        scrubberClicked = true;

        var scrubStyle = getComputedStyle(scrub.el),
            position = parseInt(scrubStyle.left, 10),
            newPosition = position + (e.clientX - scrub.last.x),
            timeStyle = getComputedStyle(timeline, 10),
            timeWidth = parseInt(timeStyle.width, 10);

        // If the scubber is trying to go negative, set it to 0.
        if (e.clientX < timeline.offsetLeft) {
            newPosition = 0;
        } else if (e.clientX > timeWidth + timeline.offsetLeft) {
            newPosition = timeWidth;
        }

        // Set the new x position in the scub object and visually move the scrubber to the new position.
        scrub.current.x = newPosition;
        scrub.el.style.left = newPosition + "px";
        scrub.last.x = e.clientX;

        // Update the timeline to follow the scrubber.
        scrubLine.current.width = newPosition + 10;
        scrubLine.el.style.width = newPosition + 10 + "px";
    }
};

// Releasing the mouse.
document.onmouseup = () => {
    mouseDown = false;

    // Used to only seek the playback when the mouse up event followed a mouse click on the actual scubber.
    if (scrubberClicked) {
        // Get the current position of the scrubber and the width of the timeline.
        let positionPX = scrub.current.x;
        let timelineWidth = parseInt(getComputedStyle(timeline, 10).width, 10);
        let seekTo = Math.floor((spotifyTrackTotalTime / timelineWidth) * positionPX);
    
        // Seek the playback to the new position.
        playbackSeek(seekTo);

        // Change the state of the scubber clicked back to false.
        scrubberClicked = false;
    }
};

/**
 * 
 * @param {number} pixel The position in terms of pixel relative to the timeline to move the scrubber to. 
 */
function updateScrubUI(pixel) {
    // Set the new x position in the scub object and visually move the scrubber to the new position.
    scrub.last.x = scrub.current.x;
    scrub.current.x = pixel;
    scrub.el.style.left = pixel + "px";

    // Update the timeline to follow the scrubber.
    scrubLine.current.width = pixel + 10;
    scrubLine.el.style.width = pixel + 10 + "px";
}

/*--------------------------------------------------------------------------*/
/* HELPER FUNCTIONS */
/*--------------------------------------------------------------------------*/

// Takes as parameter a URL and returns a JSON of the extracted query parameters.
function queryURLToJSON(string) {
    return JSON.parse('{"' + decodeURI(string.split('?')[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
}

/**
 * Converts the given time in seconds to minutes:seconds
 * @param {number} seconds Time in seconds.
 * @returns {string} formatted time
 */
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let formattedTime = minutes.toString() + ":";
    // Add a 0 in front of seconds if it is less than 10.
    if (remainingSeconds < 10) {
        formattedTime += "0";
    }
    formattedTime += remainingSeconds.toString();

    return formattedTime;
}
