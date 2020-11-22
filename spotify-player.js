// Variables for UI elements.
let playbackCoverImage = null;
let playbackTrackLabel = null;
let playbackArtistLabel = null;
let playbackTimeLabel = null;
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
let volumeScrubLine = null;
let volumeScrub = null;

// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    // If there is no volume value in cache, set it to default of 50%.
    if (!localStorage.hasOwnProperty(VOLUME_KEY)) {
        localStorage.setItem(VOLUME_KEY, 0.5);
    }

    playbackCoverImage = document.getElementById("playback-cover-image");
    playbackTrackLabel = document.getElementById("playback-track-label");
    playbackArtistLabel = document.getElementById("playback-artist-label");
    playbackTimeLabel = document.getElementById("playback-time-label");
    playbackDurationLabel = document.getElementById("playback-duration-label");

    playbackShuffleButton = document.getElementById("playback-shuffle-button");
    playbackShuffleButton.addEventListener("click", playbackShuffle);

    playbackRepeatButton = document.getElementById("playback-repeat-button");
    playbackRepeatButton.addEventListener("click", playbackToggleRepeat);

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
    
    scrub.el.onmousedown = () => {
        scrubberClicked = true;
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
    volumeTimeline = document.getElementById("volume-timeline");

    // Create the volume scrub object.
    volumeScrub = {
        el: document.getElementById("volume-scrub"),
        current: {
            x: volumeTimeline.clientWidth * localStorage.getItem(VOLUME_KEY)
        },
        last: {
            x: volumeTimeline.clientWidth * localStorage.getItem(VOLUME_KEY)
        }
    }
    volumeScrub.el.style.left = volumeScrub.current.x + "px";
    
    volumeScrub.el.onmousedown = () => {
        volumeScrubberClicked = true;
        volumeScrub.origin = volumeTimeline.offsetLeft;
        volumeScrub.last.x = volumeScrub.el.offsetLeft;
        return false;
    }

    // Create the scrub line object. This is the line that follows the scrubber along the timeline.
    volumeScrubLine = {
        el: document.getElementById("volume-scrub-line"),
        current: {
            width: volumeTimeline.clientWidth * localStorage.getItem(VOLUME_KEY) + 5
        },
    }
    volumeScrubLine.el.style.width = volumeScrubLine.current.width + "px";

    // Add the user's playlists to the drop down menu.
    spotifyPlaylists(updateUserPlaylistsUI);
});

/*--------------------------------------------------------------------------*/
/* SPOTIFY PLAYER OBJECT AND STATES */
/*--------------------------------------------------------------------------*/

// Will hold the Player Object.
let spotifyPlayer = null;
let spotifyPlayerID = null;

// The total time in ms of the current track playing.
let spotifyTrackTotalTime = 0;
// The current position in ms of the track playing.
let spotifyTrackPosition = 0;

/*--------------------------------------------------------------------------*/
/* SCRUB BAR VARIABLES */
/*--------------------------------------------------------------------------*/

// State if the scrubber has been clicked.
let scrubberClicked = false;
// The interval that updates the scrubber.
let scubberInterval = null;
// State if the volume scrubber has been clicked.
let volumeScrubberClicked = false;

/*--------------------------------------------------------------------------*/
/* CONSTANTS */
/*--------------------------------------------------------------------------*/

// Names of the stored variables in localStorage.
const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const VOLUME_KEY = "spotify_volume";
const CONTEXT_KEY = "spotify_context";
const TRACK_URI_KEY = "spotify_track";
const POSITION_KEY = "spotify_position";
const PAUSED_KEY = "spotify_paused";
const SHUFFLE_KEY = "spotify_shuffle";
const REPEAT_KEY = "spotify_repeat";

/*--------------------------------------------------------------------------*/
/* SPOTIFY PLAYER */
/*--------------------------------------------------------------------------*/

// Always refresh the access tokens when the page has loaded.
if (localStorage.hasOwnProperty(REFRESH_TOKEN_KEY)) {
    spotifyRefresh(false);
}

// Every 30 minutes, refresh the access token.
setInterval(() => {
    if (localStorage.hasOwnProperty(REFRESH_TOKEN_KEY)) {
        spotifyRefresh(true);
    }
}, 1800000);

/**
 * Once the Playback SDK is ready, this method will execute.
 */
window.onSpotifyWebPlaybackSDKReady = () => {
    // Create the Spotify Player Object.
    spotifyPlayer = new Spotify.Player({
      name: "Study Space Player",
      getOAuthToken: callback => { callback(localStorage.getItem(ACCESS_TOKEN_KEY)); },
      volume: localStorage.getItem(VOLUME_KEY)
    });

    // Connect the Spotify Player.
    spotifyPlayer.connect().then(success => {
        if (success) {
            console.log("Spotify Player connected!");
        }
    });
    
    // Error handling
    spotifyPlayer.addListener("initialization_error", ({ message }) => { console.error(message); });
    spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error(message);
        spotifyRefresh(); 
    });
    spotifyPlayer.addListener("account_error", ({ message }) => { console.error(message); });
    spotifyPlayer.addListener("playback_error", ({ message }) => { console.error(message); });
    
    // Playback status updates
    spotifyPlayer.addListener("player_state_changed", (state) => {
        // Set the global variable for total track time.
        spotifyTrackTotalTime = state.track_window.current_track.duration_ms;
        // Set the global variable for the position of the track.
        spotifyTrackPosition = state.position;
        
        // Stop the scrub animation if the playback is paused. If it is not, start the animation.
        if (state.paused) {
            scrubStop();
        } else if (scubberInterval == null) {
            scrubStart();
        }

        // Store the current playback state in session storage.
        sessionStorage.setItem(CONTEXT_KEY, state.context.uri);
        sessionStorage.setItem(TRACK_URI_KEY, state.track_window.current_track.uri);
        sessionStorage.setItem(POSITION_KEY, state.position);
        sessionStorage.setItem(PAUSED_KEY, state.paused);
        sessionStorage.setItem(SHUFFLE_KEY, state.shuffle);
        sessionStorage.setItem(REPEAT_KEY, state.repeat_mode);
        
        updatePlaybackUI();
    });
    
    // Ready
    spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        spotifyPlayerID = device_id;

        // Once the player is ready, recover the playback state if there is one.
        if (sessionStorage.hasOwnProperty(CONTEXT_KEY)) {
            spotifyPlayPreviousState();
        }
    });
  
    // Not Ready
    spotifyPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });
};

// Pause/play the current track being played.
function playbackToggle() {
    spotifyPlayer.togglePlay().then(() => {
        
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
        playbackTimeLabel.innerHTML = formatTime(seekTo / 1000);
    });
}

// Toggles shuffle for the playback.
function playbackShuffle() {
    const shuffleEndpoint = "https://api.spotify.com/v1/me/player/shuffle";
    const state = !(sessionStorage.getItem(SHUFFLE_KEY) == "true");

    const shuffleQuery = shuffleEndpoint + 
            "?state=" + encodeURIComponent(state);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", shuffleQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Shuffle state changed.");
        }
    }
    xmlHTTP.send();
}

// Sets the repeat mode for the playback.
function playbackToggleRepeat() {
    const repeatEndpoint = "https://api.spotify.com/v1/me/player/repeat";
    let state = null;

    // Here we up the current state, so if the user had off, change it to context, and so on.
    if (sessionStorage.getItem(REPEAT_KEY) == 0) {
        state = "context";
    } else if (sessionStorage.getItem(REPEAT_KEY) == 1) {
        state = "track";
    } else if (sessionStorage.getItem(REPEAT_KEY) == 2) {
        state = "off";
    }
    
    const repeatQuery = repeatEndpoint + 
            "?state=" + encodeURIComponent(state);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", repeatQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Repeat state changed.")
        }
    }
    xmlHTTP.send();
}

/**
 * Sets the repeat state to the given parameter.
 * @param {number} repeatState The state to set the repeat to. 0 - no repeat, 1 - repeat context, 2 - repeat track. 
 */
function playbackSetRepeat(repeatState) {
    const repeatEndpoint = "https://api.spotify.com/v1/me/player/repeat";
    let state = repeatState;

    // Translate the repeat state argument to its corresponding string representation.
    if (repeatState == 0) {
        state = "off";
    } else if (repeatState == 1) {
        state = "context";
    } else if (repeatState == 2) {
        state = "track";
    }
    
    const repeatQuery = repeatEndpoint + 
            "?state=" + encodeURIComponent(state);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", repeatQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Repeat state changed.")
        }
    }
    xmlHTTP.send();
}

/**
 * Sets the volume of the playback.
 * @param {number} volume The volume (decimal between 0 and 1)
 */
function playbackVolume(volume) {
    spotifyPlayer.setVolume(volume).then(() => {
        localStorage.setItem(VOLUME_KEY, volume);
    });
}

/**
 * Gets the current state of the playback and updates the UI accordingly.
 */
function updatePlaybackUI() {
    spotifyPlayer.getCurrentState().then((state) => {
        // Holds the track JSON.
        let item = state.track_window.current_track;

        // Info of the current playback.
        let track = item.name;
        let artist = item.artists[0].name;
        // There can be multiple artists, if so comma seperate them.
        for (let i = 1; i < item.artists.length; i++) {
            artist += ", " + item.artists[i].name;
        }
        let totalTrackTime = item.duration_ms;
        let coverURL = item.album.images[2].url;
        let trackPosition = state.position;

        // States.
        let pausedState = state.paused;
        let shuffleState = state.shuffle;
        let repeatState = state.repeat_mode;

        // Update the UI using the above info.
        playbackTrackLabel.innerHTML = track;
        playbackArtistLabel.innerHTML = artist;
        playbackDurationLabel.innerHTML = formatTime(totalTrackTime / 1000);
        playbackCoverImage.src = coverURL;

        // Change the UI and color of the play/pause, shuffle, and repeat buttons.
        if (pausedState) {
            playbackToggleButton.innerHTML = "play_circle_outline";
        } else {
            playbackToggleButton.innerHTML = "pause_circle_outline";
        }
    
        if (shuffleState) {
            playbackShuffleButton.style.color = "var(--color-button)";
        } else {
            playbackShuffleButton.style.color = "var(--color-tertiary)";
        }
    
        if (repeatState == 0) {
            playbackRepeatButton.style.color = "var(--color-tertiary)";
            playbackRepeatButton.innerHTML = "repeat";
        } else if (repeatState == 1) {
            playbackRepeatButton.style.color = "var(--color-button)";
        } else if (repeatState == 2) {
            playbackRepeatButton.style.color = "var(--color-button)";
            playbackRepeatButton.innerHTML = "repeat_one";
        }
    });
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
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
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
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Playing!");
        }
    }
    xmlHTTP.send(body);
}

/**
 * Plays the current state which is stored in session storage.
 */
function spotifyPlayPreviousState() {
    // Query parameters.
    const playEndpoint = "https://api.spotify.com/v1/me/player/play";
    const device_id = spotifyPlayerID;

    // Build the request URI.
    const playQuery = playEndpoint +
            "?device_id=" + encodeURIComponent(device_id);
            
    // PUT request body parameters.
    const body = JSON.stringify({
        context_uri: sessionStorage.getItem(CONTEXT_KEY),
        offset: {
            uri: sessionStorage.getItem(TRACK_URI_KEY)
        },
        position_ms: sessionStorage.getItem(POSITION_KEY)
    });

    const previousPausedState = sessionStorage.getItem(PAUSED_KEY);
    const previousShuffleState = sessionStorage.getItem(SHUFFLE_KEY);
    const previousRepeatState = sessionStorage.getItem(REPEAT_KEY);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("PUT", playQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(ACCESS_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 204) {
            console.log("Recovered previous state!");
            setTimeout(() => {
                if (previousPausedState == "true") {
                    playbackToggle();
                }
                if (previousShuffleState == "true") {
                    playbackShuffle();
                }
                playbackSetRepeat(previousRepeatState);
            }, 1000);
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
function spotifyRefresh(async) {
    // Query parameters for making a request to the backend server.
    const refreshEndpoint = window.location.origin + "/api/spotify/refresh/";
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // Build the request URI.
    const refreshQuery = refreshEndpoint + 
            "?refresh_token=" + encodeURIComponent(refreshToken);

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", refreshQuery, async);
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 200) {
            // Upon receiving a response, store the new access token.
            let response = JSON.parse(xmlHTTP.responseText);
            console.log(response);
            localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);

            // Sometimes we will also get a new refresh token from Spotify, if so store the new refresh token.
            if (response.hasOwnProperty("refresh_token")) {
                localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
            }
        }
    }
    xmlHTTP.send();
}

/*--------------------------------------------------------------------------*/
/* SCRUB BAR */
/*--------------------------------------------------------------------------*/

function scrubStart() {
    let updateInterval = 10;
    scubberInterval = setInterval(() => {
        spotifyTrackPosition += updateInterval;
        sessionStorage.setItem(POSITION_KEY, spotifyTrackPosition);
        
        let timelineWidth = parseInt(getComputedStyle(timeline, 10).width, 10);
        let newScrubPosition = spotifyTrackPosition / spotifyTrackTotalTime * timelineWidth;
    
        if (newScrubPosition > timelineWidth - 10) {
            newScrubPosition = timelineWidth - 10;
        }
    
        playbackTimeLabel.innerHTML = formatTime(spotifyTrackPosition / 1000);
        updateScrubUI(newScrubPosition);
    }, updateInterval);
}

function scrubStop() {
    clearInterval(scubberInterval);
    scubberInterval = null;
}

// Upon clicking the mouse.
document.onmousemove = (e) => {
    if (scrubberClicked) {
        // Kill the interval that is updating the scrubber while the mouse is down.
        scrubStop();

        let scrubStyle = getComputedStyle(scrub.el),
            position = parseInt(scrubStyle.left, 10),
            newPosition = position + (e.clientX - scrub.last.x),
            timeStyle = getComputedStyle(timeline, 10),
            timeWidth = parseInt(timeStyle.width, 10);
        
        // If the scubber is trying to go negative, set it to 0.
        if (e.clientX < timeline.offsetLeft) {
            newPosition = 0;
        } else if (e.clientX > timeWidth + timeline.offsetLeft) {
            newPosition = timeWidth - 10;
        }

        // Set the new x position in the scub object and visually move the scrubber to the new position.
        scrub.current.x = newPosition;
        scrub.el.style.left = newPosition + "px";
        scrub.last.x = e.clientX;

        // Update the timeline to follow the scrubber.
        scrubLine.current.width = newPosition + 10;
        scrubLine.el.style.width = newPosition + 10 + "px";
    } else if (volumeScrubberClicked) {
        let volumeScrubStyle = getComputedStyle(volumeScrub.el),
            position = parseInt(volumeScrubStyle.left, 10),
            newPosition = position + (e.clientX - volumeScrub.last.x),
            timeStyle = getComputedStyle(volumeTimeline, 10),
            timeWidth = parseInt(timeStyle.width, 10);

        // If the scubber is trying to go negative, set it to 0.
        if (e.clientX < volumeTimeline.offsetLeft) {
            newPosition = 0;
        } else if (e.clientX > timeWidth + volumeTimeline.offsetLeft) {
            newPosition = timeWidth;
        }

        // Set the new x position in the scub object and visually move the scrubber to the new position.
        volumeScrub.current.x = newPosition;
        volumeScrub.el.style.left = newPosition + "px";
        volumeScrub.last.x = e.clientX;

        // Update the timeline to follow the scrbber.
        volumeScrubLine.current.width = newPosition + 5;
        volumeScrubLine.el.style.width = newPosition + 5 + "px";
    }
};

// Releasing the mouse.
document.onmouseup = () => {
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
    } else if (volumeScrubberClicked) {
        // Calculate the volume based on the position of the scrubber
        let positionPX = volumeScrub.current.x;
        let timelineWidth = parseInt(getComputedStyle(volumeTimeline, 10).width, 10);
        let volume = positionPX / timelineWidth;

        // Set the volume of the playback.
        playbackVolume(volume);
    
        // Change the state of the volume scubber clicked back to false.
        volumeScrubberClicked = false;
    }
};

/**
 * 
 * @param {number} pixel The position in terms of pixel relative to the timeline to move the scrubber to. 
 */
function updateScrubUI(pixel) {
    // Set the new x position in the scub object and visually move the scrubber to the new position.
    scrub.last.x = scrub.el.offsetLeft;
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
