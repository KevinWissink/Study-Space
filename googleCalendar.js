const GOOGLE_TOKEN_KEY = "google_access_token";
const GOOGLE_EMAIL_KEY = "google_email";

/**
 * Returns the email of the authorized user.
 */
function getEmail() {
    const profileQuery = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", profileQuery, true);
    xmlHTTP.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(GOOGLE_TOKEN_KEY));
    xmlHTTP.onreadystatechange = () => {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 200) {
            localStorage.setItem(GOOGLE_EMAIL_KEY, JSON.parse(xmlHTTP.response).emailAddress);
        }
    }
    
    xmlHTTP.send();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calendarFrame").src = "https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=America%2FChicago&amp;mode=AGENDA&amp;src=" + localStorage.getItem(GOOGLE_EMAIL_KEY) + "&amp;color=%237986CB&amp;showPrint=0&amp;showTabs=1&amp;showTz=0&amp;showDate=0&amp;showNav=0&amp;showTitle=0";
});
