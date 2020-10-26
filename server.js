/*
    File: server.js
    Purpose: This is the back end of our application. It will handle the
        exchange of tokens and client secrets for Spotify and Google.
*/

/*--------------------------------------------------------------------------*/
/* IMPORTS */
/*--------------------------------------------------------------------------*/
let express = require("express");
let app = express();
// For .env file which will hold sensitive information such as client secerts and ids.
require("dotenv").config();

// For making REST API calls such as GET and POST.
let axios = require("axios");
// To convert JSON to strings when letructing parameters.
let querystring = require("querystring");

/*--------------------------------------------------------------------------*/
/* GLOBAL VARIABLES */
/*--------------------------------------------------------------------------*/
// Loads the port number assigned by Heroku. If developing locally, load port 3000.
const PORT = process.env.PORT || 3000;
// Domains for our the back end and the front end.
const DOMAIN_BACK_END = "http://localhost:3000";
const DOMAIN_FRONT_END = "http://localhost:5500";
// The URI to redirect after user grants permission. This URI must be registered with Spotify.
const REDIRECT_URI = DOMAIN_BACK_END + "/spotify/callback/";


/**
 * User is redirected here after clicking a login button. This method will simply
 * build a URL to an authroization prompt where the user can either grant or deny
 * this application permission.
 * 
 * As parameters to the authentication endpoint, we must specify which permissions 
 * we need the user to give us permission for. The following is a list of the scopes 
 * along with a description of what they will be used for.
 * 
 * streaming: for Playback SDK
 * user-read-email: for Playback SDK
 * user-read-private: for Playback SDK
 * user-modify-playback-state: For all playback controls such as play, pause, next, previous, etc.
 * playlist-read-private: For getting the user's private playlists.
 * playlist-read-collaborative: For getting the user's "Collaborative" playlists.
 */
app.get("/spotify/login/", (req, res) => {
    // Parameters for authorization.
    let authEndpoint = "https://accounts.spotify.com/authorize";
    let responseType = "code";
    let scope = "streaming user-read-email user-read-private user-modify-playback-state playlist-read-private playlist-read-collaborative";

    // Full authorization URL with parameters.
    let authorizeURL = authEndpoint + 
            "?client_id=" + encodeURIComponent(process.env.SPOTIFY_CLIENT_ID) + 
            "&response_type=" + responseType + 
            "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&scope=" + encodeURIComponent(scope);

    // Redirects the user to grant our application permission.
    res.redirect(authorizeURL);
});

/**
 * After the user accepts or denies permissions, they will be redirected here.
 * If the user granted permission, exchange for access and refresh tokens and redirect back to site.
 * Otherwise, redirect the user back to the landing page.
 */
app.get("/spotify/callback/", (req, res) => {
    // The case where user denied our application permission.
    if (req.query.hasOwnProperty("error")) {
        // Redirect the user back to the landing page.
        res.redirect(DOMAIN_FRONT_END + "/index.html");
    } else if (req.query.hasOwnProperty("code")) {
        // Encode the client ID and secret.
        let encodedCredentials = Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET, "utf8").toString("base64");

        // Build an Axios POST request to exchange our code key for access tokens and refresh token.
        axios({
            method: "post",
            url: "https://accounts.spotify.com/api/token",
            data: querystring.stringify({
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: REDIRECT_URI
            }),
            headers: {
                "Authorization": "Basic " + encodedCredentials,
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => {
            // Redirect the user back to the "homepage" <domain.com/> with the response data as query parameters.
            res.redirect(DOMAIN_FRONT_END + "/spotify-player.html?" + querystring.stringify(response.data));
        }).catch(error => {
            console.log(error);
        });
    }
});

/**
 * Used to refresh an expired access token using the refresh token. The request to this back end function
 * is made by the front end. This function then returns the response from Spotify as a response to the original
 * request from the front end. The response will contain a new access token and possibly a 
 */
app.get("/spotify/refresh/", (req, res) => {
    // Encode the client ID and secret.
    let encodedCredentials = Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET, "utf8").toString("base64");

    // Build an Axios POST request to request a new access token using refresh token.
    axios({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: req.query.refresh_token
        }),
        headers: {
            "Authorization": "Basic " + encodedCredentials,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(response => {
        // For preventing a CORS error.
        res.setHeader("Access-Control-Allow-Origin", DOMAIN_FRONT_END);
        // Send the response from Spotify as a response to this request.
        res.json(response.data);
    }).catch(error => {
        console.log(error);
    });
});

app.listen(PORT, () => {
    console.log("Listening to " + PORT);
});
