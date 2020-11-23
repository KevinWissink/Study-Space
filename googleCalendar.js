const GOOGLE_TOKEN_KEY = "google_access_token";
const GOOGLE_EMAIL_KEY = "google_email";

/**
 * Returns the email of the authorized user.
 */
function getEmail() {
    const profileQuery = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", profileQuery, false);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(GOOGLE_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.status == 200) {
            localStorage.setItem(GOOGLE_EMAIL_KEY, JSON.parse(xmlHTTP.response).emailAddress);
        }
    }
    
    xmlHTTP.send();
}

getEmail();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calendarFrame").setAttribute("src", "https://calendar.google.com/calendar/embed?src=" + encodeURIComponent(localStorage.getItem(GOOGLE_EMAIL_KEY)) + "&ctz=America%2FChicago");
});
