// Variables for UI elements.
var navigationOpenButton = null;
var navigationCloseButton = null;

var googleConnectButton = null;
var spotifyConnectButton = null;

// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    // check if nav bar should already be open
    if (sessionStorage.getItem('nav-open') === null) {
        sessionStorage.setItem('nav-open', 'false');
    } else if (sessionStorage.getItem('nav-open') == 'true') {
        let navBar = document.getElementById('side-navigation-bar');
        let main = document.getElementById('main');
        navBar.classList.add('no-transition');
        main.classList.add('no-transition');
        openNav();
        navBar.offsetWidth; // forcing "reflow" to ensure updates occur while no-transition class is added
        main.offsetWidth;
        navBar.classList.remove('no-transition');
        main.classList.remove('no-transition');
    }

    // The following two sections of code handle the opening and closing of the side navigation menu.
    navigationOpenButton = document.getElementById("navigation-open-button");
    navigationOpenButton.addEventListener("click", openNav);

    navigationCloseButton = document.getElementById("navigation-close-button");
    navigationCloseButton.addEventListener("click", closeNav);

    document.getElementById("study-break-button").href = "./study-break.html";
    document.getElementById("study-space-button").href = "./study-space.html";

    googleConnectButton = document.getElementById("google-login-button");
    spotifyConnectButton = document.getElementById("spotify-login-button");
    
    // Check if the user has already logged into Spotify or Google.
    if (localStorage.hasOwnProperty("google_access_token")) {
        googleConnectButton.innerHTML = "Log Out of Google";
        googleConnectButton.addEventListener("click", googleLogout);
    } else {
        googleConnectButton.innerHTML = "Connect to Google";
        googleConnectButton.addEventListener("click", googleLogin);
    }

    if (localStorage.hasOwnProperty("spotify_access_token")) {
        spotifyConnectButton.innerHTML = "Log Out of Spotify";
        spotifyConnectButton.addEventListener("click", spotifyLogout);
    } else {
        spotifyConnectButton.innerHTML = "Connect to Spotify";
        spotifyConnectButton.addEventListener("click", spotifyLogin);
    }
});

/*--------------------------------------------------------------------------*/
/* CONSTANTS */
/*--------------------------------------------------------------------------*/

// The endpoint of the backend server to start the login process with Spotify and Google.
const GOOGLE_LOGIN_ENDPOINT = "./api/google/login";
const SPOTIFY_LOGIN_ENDPOINT = "./api/spotify/login";

// The key values of the access and refresh tokens in localStorage.
const GOOGLE_ACCESS_TOKEN_KEY = "google_access_token";
const GOOGLE_REFRESH_TOKEN_KEY = "google_refresh_token";
const SPOTIFY_ACCESS_TOKEN_KEY = "spotify_access_token";
const SPOTIFY_REFRESH_TOKEN_KEY = "spotify_refresh_token";
const SPOTIFY_VOLUME_KEY = "spotify_volume";

// Starts the login process for Google when the login button is pressed.
function googleLogin() {
    window.location.href = GOOGLE_LOGIN_ENDPOINT;
}

// Clears the Google access and refresh tokens from localStorage and refreshes the page.
function googleLogout() {
    // Wipe localStorage values.
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(GOOGLE_REFRESH_TOKEN_KEY);

    // Refresh the page.
    window.location.href = window.location.href;
}

// Starts the login process when the login button is pressed.
function spotifyLogin() {
    window.location.href = SPOTIFY_LOGIN_ENDPOINT;
}

// Clears the Spotify access and refresh tokens from localStorage and refreshes the page.
function spotifyLogout() {
    // Wipe localStorage values.
    localStorage.removeItem(SPOTIFY_ACCESS_TOKEN_KEY);
    localStorage.removeItem(SPOTIFY_REFRESH_TOKEN_KEY);
    localStorage.removeItem(SPOTIFY_VOLUME_KEY);

    // Refresh the page.
    window.location.href = window.location.href;
}

function openNav() {
    // Make the navigation appear by setting its width to non-zero.
    document.getElementById("side-navigation-bar").style.width = 250 + "px";
    // Move the main content over by the same amount of width as the side navigation menu.
    document.getElementById("main").style.marginLeft = 250 + "px";
    // update session storage with nav change
    sessionStorage.setItem('nav-open', 'true');
}

function closeNav() {
    // Make the side navigation menu disappear.
    document.getElementById("side-navigation-bar").style.width = 0;
    // Move the main content back.
    document.getElementById("main").style.marginLeft = 0;
    // update session storage with nav change
    sessionStorage.setItem('nav-open', 'false');
}