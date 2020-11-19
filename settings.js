var themeTransitions = "color 0.2s, background-color 0.2s, border-color 0.2s, outline-color 0.2s, box-shadow 0.2s";

// Wait for the DOM to finish loading to add events for buttons
document.addEventListener("DOMContentLoaded", () => {
    // check local storage for previously set theme
    if (localStorage.getItem('theme') === null) {
        setTheme('theme-dark');
    } else {
        setTheme(localStorage.getItem('theme'));
    }

    document.getElementById("change-theme").addEventListener('click', () => { toggleTheme(); } );

    let bodyTransitions = themeTransitions + ", margin-left 0.5s"; // margins for opening/closing nav bar
    document.body.style.transition = bodyTransitions;
    // set width transition only for all nav bar elements (else complications with scrub bar)
    let navBar = document.getElementById("side-navigation-bar");
    if (navBar)
    {
        navBar.style.transition = bodyTransitions + ", width 0.5s";
    }
});


/***** THEMES *****/
// https://medium.com/@haxzie/dark-and-light-theme-switcher-using-css-variables-and-pure-javascript-zocada-dd0059d72fa2

// function to set a given theme/color-scheme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

// function to toggle between light and dark theme
function toggleTheme() {
   if (localStorage.getItem('theme') === 'theme-dark'){
       setTheme('theme-light');
   } else {
       setTheme('theme-dark');
   }
}