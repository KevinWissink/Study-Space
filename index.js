document.getElementByID("spotify-login").onclick = spotifyLogin;
// The endpoint of the backend server to start the login process with Spotify.
const SPOTIFY_LOGIN_ENDPOINT = "https://study-space-tamu.herokuapp.com/api/spotif/login";

// Starts the login process when the login button is pressed.
function spotifyLogin() {
    window.location.href = SPOTIFY_LOGIN_ENDPOINT;
}
