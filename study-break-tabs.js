document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("slideshow-tab").addEventListener("click", function(){openTab('slideshow-tab', 'slideshow')});
    document.getElementById("breed-tab").addEventListener("click", function(){openTab('breed-tab', 'breeds')});
    document.getElementById("favorite-tab").addEventListener("click", function(){openTab('favorite-tab', 'Favorites')});

    document.getElementById("slideshow-tab").click();
});

function openTab(buttonID, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(buttonID).className += " active";
}
