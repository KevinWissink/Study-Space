document.onkeydown = (keyDownEvent) => { 
    console.log(keyDownEvent.key);
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
};