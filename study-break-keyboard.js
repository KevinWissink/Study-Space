document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("help-text").innerHTML = 
        '<h4 class="help-label">Spotify Keyboard Shortcuts</h4>' +
        '<p><span class="key">⬆️</span>Increase Volume</p>' +
        '<p><span class="key">⬇️</span>Decrease Volume</p>' +
        '<p><span class="key">⬅️</span>Previous Song</p>' +
        '<p><span class="key">➡️</span>Skip Song</p>' +
        '<h4 class="help-label">Study Break Keyboard Shortcuts</h4>' +
        '<p><span class="key"><kbd>S</kbd></span>Slideshow Tab</p>' +
        '<p><span class="key"><kbd>B</kbd></span>Breed Tab</p>' +
        '<p><span class="key"><kbd>V</kbd></span>Favorite Tab</p>' +
        '<p><span class="key"><kbd>I</kbd></span>Inspire Me</p>';
});

document.onkeydown = (keyDownEvent) => {
    //console.log(keyDownEvent.key);
    var isSafe = !document.activeElement.classList.contains('text-field');
    //console.log(isSafe);
    
    if(isSafe){
        if (keyDownEvent.key == "ArrowLeft") {//prev track
            document.getElementById("playback-previous-button").focus();
            document.getElementById("playback-previous-button").click();
        }
    
        if (keyDownEvent.key == "ArrowRight") {//skip track
            document.getElementById("playback-next-button").focus();
            document.getElementById("playback-next-button").click();
        }
    
        if (keyDownEvent.key == "ArrowUp") {//inc volume
        }
    
        if (keyDownEvent.key == "ArrowDown") {//dec volume
        }

        if (keyDownEvent.key == "s") {
            document.getElementById("slideshow-tab").focus();
            document.getElementById("slideshow-tab").click();
        }
        if (keyDownEvent.key == "b") {
            document.getElementById("breed-tab").focus();
            document.getElementById("breed-tab").click();
        }
        if (keyDownEvent.key == "v") {
            document.getElementById("favorite-tab").focus();
            document.getElementById("favorite-tab").click();
        }

        if (keyDownEvent.key == "i") {
            document.getElementById("affirmation-button").focus();
            document.getElementById("affirmation-button").click();
        }
    }
};