const proxyurl = "https://cors-anywhere.herokuapp.com/";
const aurl = "https://www.affirmations.dev/"; // site that doesn’t send Access-Control-*
const durl = "https://dog.ceo/api/breeds/image/random/"; // site that doesn’t send Access-Control-*
const burl_1 = "https://dog.ceo/api/breed/";
const burl_2 = "/images/random"; // site that doesn’t send Access-Control-*
var dogImg = null;
var initialImgLoaded = false;

// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("slideshow-fetch-button").addEventListener("click", fetch_dog);
    document.getElementById("breeds-fetch-button").addEventListener("click", fetch_breed);
    document.getElementById("affirmation-button").addEventListener("click", fetch_affirmation);

    document.getElementById("slideshow-checkbox").addEventListener("change", function(){handleSlides(this)});

    dogImg = document.createElement("img");
    dogImg.id = "slideshow-img";
    initialImgLoaded = false;

    handleSlides(document.getElementById("slideshow-checkbox"));
    fetch_affirmation();
    fetch_dog();
    fetch_breed();
});

function fetch_affirmation(){
    fetch(proxyurl + aurl)
    .then(response => response.text())
    .then(contents => {
        console.log(JSON.parse(contents));
        document.getElementById("affirmation-result").innerText=JSON.parse(contents).affirmation;
    })
    .catch(() => document.getElementById("affirmation-result").innerText=("We're sorry, but affirmations are currently down right now. Stay strong and do your best!"));
}

function fetch_dog(){
    fetch(proxyurl + durl)
    .then(response => response.text())
    .then(contents => {
        console.log(JSON.parse(contents));
        if (initialImgLoaded == false){
            document.getElementById("slideshow").appendChild(dogImg);
            initialImgLoaded = true;
        }
        document.getElementById("slideshow-img").src=JSON.parse(contents).message;
    })
    .catch(() => console.log("Can’t access " + durl + " response."))
}

function fetch_breed(){
    var e = document.getElementById("breed-selector");
    var breed = e.options[e.selectedIndex].value;
    console.log(breed);
    burl = burl_1 + breed + burl_2
    fetch(proxyurl + burl)
    .then(response => response.text())
    .then(contents => {
        console.log(JSON.parse(contents));
        document.getElementById("breeds-img").src=JSON.parse(contents).message;
    })
    .catch(() => console.log("Can’t access " + burl + " response. Blocked by browser?"))
}

function handleSlides(cb){
    if(cb.checked == true && document.getElementById("slideshow-tab").classList.contains('active')){
        fetch_dog()
        setTimeout(function(){handleSlides(cb)}, 5000);
    }
}