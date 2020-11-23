document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("help-text").innerHTML = 
        '<h4 class="help-label">Spotify Keyboard Shortcuts</h4>' +
        '<p><span class="key">⬅️</span>Previous Song</p>' +
        '<p><span class="key">➡️</span>Skip Song</p>' +
        '<p><span class="key"><kbd class="space-kbd"><span>␣</span></kbd></span>Pause Song</p>' +
        '<h4 class="help-label">Study Break Keyboard Shortcuts</h4>' +
        '<p><span class="key"><kbd>S</kbd></span>Slideshow Tab</p>' +
        '<p><span class="key"><kbd>B</kbd></span>Breeds Tab</p>' +
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

        if (keyDownEvent.key == " ") {//play/pause
            document.getElementById("playback-toggle-button").focus();
            document.getElementById("playback-toggle-button").click();
            document.getElementById("playback-toggle-button").blur();
        }

        if (keyDownEvent.key == "s") {
            document.getElementById("slideshow-tab").focus();
            document.getElementById("slideshow-tab").click();
        }

        if (keyDownEvent.key == "b") {
            document.getElementById("breed-tab").focus();
            document.getElementById("breed-tab").click();
        }

        if (keyDownEvent.key == "i") {
            document.getElementById("affirmation-button").focus();
            document.getElementById("affirmation-button").click();
        }
    }
};