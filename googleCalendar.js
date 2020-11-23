function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);

    let iframeSRC = `https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=America%2FChicago&amp;mode=AGENDA&amp;src=${profile.getEmail()}&amp;color=%237986CB&amp;showPrint=0&amp;showTabs=1&amp;showTz=0&amp;showDate=0&amp;showNav=0&amp;showTitle=0`;
}

document.addEventListener("DOMContentLoaded", () => {
    // let googleToken = localStorage.getItem("google_access_token");
    // console.log(googleToken);
    document.getElementById("calendarFrame").src = 'https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=America%2FChicago&amp;mode=AGENDA&amp;src=falloutdays@gmail.com&amp;color=%237986CB&amp;showPrint=0&amp;showTabs=1&amp;showTz=0&amp;showDate=0&amp;showNav=0&amp;showTitle=0';
});
