/**
 * The purpose of this file is to simply store the response from Google or Spotify authentication (which are stored
 * as query parameters in the URL) into the localStorage. Once those are stored, redirect the user to the main page.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Parse the query parameters.
    let responseJSON = queryURLToJSON(window.location.href);

    // Store the access tokens.
    if (responseJSON.from == "google") {
        localStorage.setItem("google_access_token", responseJSON.access_token);
        localStorage.setItem("google_refresh_token", responseJSON.refresh_token);
    } else if (responseJSON.from == "spotify") {
        localStorage.setItem("spotify_access_token", responseJSON.access_token);
        localStorage.setItem("spotify_refresh_token", responseJSON.refresh_token);
    }

    // Redirect the user to the main study page.
    window.location.replace("./study-space.html");
});

// Takes as parameter a URL and returns a JSON of the extracted query parameters.
function queryURLToJSON(string) {
    return JSON.parse('{"' + decodeURI(string.split('?')[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
}
