// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("dog_button").addEventListener("click", fetch_dog);
    document.getElementById("affirmation_button").addEventListener("click", fetch_affirmation);
});

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const aurl = "https://www.affirmations.dev/"; // site that doesn’t send Access-Control-*
const durl = "https://dog.ceo/api/breeds/image/random/"; // site that doesn’t send Access-Control-*

function fetch_affirmation(){
    fetch(proxyurl + aurl)
    .then(response => response.text())
    .then(contents => {
        console.log(JSON.parse(contents));
        document.getElementById("affirmation_result").innerText=JSON.parse(contents).affirmation;
    })
    .catch(() => document.getElementById("affirmation_result").innerText=("We're sorry but affirmations are currently down right now, stay strong and do your best!"));
}

function fetch_dog(){
    fetch(proxyurl + durl)
    .then(response => response.text())
    .then(contents => {
        console.log(JSON.parse(contents));
        document.getElementById("dog_result").src=JSON.parse(contents).message;
    })
    .catch(() => console.log("Can’t access " + durl + " response. Blocked by browser?"))
}

fetch_dog()
fetch_affirmation()