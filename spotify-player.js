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
    if (!localStorage.hasOwnProperty(VOLUME)) {
        localStorage.setItem(VOLUME, 0.5);
    }

    playbackCoverImage = document.getElementById("playback-cover-image");
    playbackTrackLabel = document.getElementById("playback-track-label");
    playbackArtistLabel = document.getElementById("playback-artist-label");
    playbackTimeLabel = document.getElementById("playback-time-label");
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
            x: volumeTimeline.offsetWidth * localStorage.getItem(VOLUME)
        },
        last: {
            x: volumeTimeline.offsetWidth * localStorage.getItem(VOLUME)
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
            width: volumeTimeline.offsetWidth * localStorage.getItem(VOLUME) + 5
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

// The playback state, false for playing, true for paused.
let spotifyIsPausedState = false;
// The shuffle state of the player.
let spotifyShuffleState = false;
// The repeat state of the player. 0 is off, 1 is repeat context, 2 is repeat track.
let spotifyRepeatState = 0;
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
const ACCESS_TOKEN = "spotify_access_token";
const REFRESH_TOKEN = "spotify_refresh_token";
const VOLUME = "spotify_volume";

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
      getOAuthToken: callback => { callback(localStorage.getItem(ACCESS_TOKEN)); },
      volume: localStorage.getItem(VOLUME)
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
        // Set the global variable for the position of the track.
        spotifyTrackPosition = state.position;
        
        if (!isPaused && scubberInterval == null) {
            scrubStart();
        }
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
        scrubStop();
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
 * Sets the volume of the playback.
 * @param {number} volume The volume (decimal between 0 and 1)
 */
function playbackVolume(volume) {
    spotifyPlayer.setVolume(volume).then(() => {
        localStorage.setItem(VOLUME, volume);
    });
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
    const refreshEndpoint = window.location.origin + "/api/spotify/refresh/";
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

function scrubStart() {
    let updateInterval = 10;
    scubberInterval = setInterval(() => {
        spotifyTrackPosition += updateInterval;
        
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
