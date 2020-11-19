document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("help-text").innerHTML = 
        '<h4 class="help-label">Spotify Keyboard Shortcuts</h4>' +
        '<p><span class="key">⬆️</span>Increase Volume</p>' +
        '<p><span class="key">⬇️</span>Decrease Volume</p>' +
        '<p><span class="key">⬅️</span>Previous Song</p>' +
        '<p><span class="key">➡️</span>Skip Song</p>' +
        '<p><span class="key"><kbd class="space-kbd"><span>␣</span></kbd></span>Pause Song</p>' +
        '<h4 class="help-label">Study Break Keyboard Shortcuts</h4>' +
        '<p><span class="key"><kbd>S</kbd></span>Switch to Study Break</p>';
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

        if (keyDownEvent.key == " ") {//play/pause
            document.getElementById("playback-toggle-button").focus();
            document.getElementById("playback-toggle-button").click();
        }

        if (keyDownEvent.key == "s") {//study break
            document.getElementById("study-break-button").focus();
            document.getElementById("study-break-button").click();
        }
    }
};