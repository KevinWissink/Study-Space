document.onkeydown = (keyDownEvent) => { 
    if (keyDownEvent.key == "f") {
        document.getElementById("dog-fetch").focus();
        document.getElementById("dog-fetch").click();
    }
    if (keyDownEvent.key == "b") {
        document.getElementById("dog-breed").focus();
        document.getElementById("dog-breed").click();
    }
    if (keyDownEvent.key == "v") {
        document.getElementById("dog-fav").focus();
        document.getElementById("dog-fav").click();
    }

    if (keyDownEvent.key == "i") {
        document.getElementById("affirmation-button").focus();
        document.getElementById("affirmation-button").click();
    }
};