// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("spotify-login-button").addEventListener("click", spotifyLogin);
    document.getElementById("google-login-button").addEventListener("click", googleLogin);
});

// The endpoint of the backend server to start the login process with Spotify.
const SPOTIFY_LOGIN_ENDPOINT = "https://study-space-tamu.herokuapp.com/api/spotify/login";
const GOOGLE_LOGIN_ENDPOINT = "https://study-space-tamu.herokuapp.com/api/google/login";

// Starts the login process when the login button is pressed.
function spotifyLogin() {
    window.location.href = SPOTIFY_LOGIN_ENDPOINT;
}

// Starts the login process for Google when the login button is pressed.
function googleLogin() {
    window.location.href = GOOGLE_LOGIN_ENDPOINT;
}
