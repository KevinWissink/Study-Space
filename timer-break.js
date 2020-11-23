// Variables for UI elements
var timerContainer = null;
var activeTimerMenu = null;
var timeoutSound = new Audio("timer-sound.mp3");
const playSymbol = '<span class="play-symbol material-icons">play_circle_outline</span>';
const pauseSymbol = '<span class="pause-symbol material-icons">pause_circle_outline</span>';

// Wait for the DOM to finish loading to add events for buttons
document.addEventListener("DOMContentLoaded", () => {
    timeoutSound.load();

    timerContainer = document.getElementById("timer-container");
    activeTimerMenu = document.getElementById('active-timer-menu');

    loadTimer();
});

function loadTimer()
{
    let totalSecs = null;
    if (totalSecs = sessionStorage.getItem("break-timer"))
    {
        totalSecs = parseInt(totalSecs);
        createBreakTimer(totalSecs);
        setInterval(updateTimer, 1000);
    }
    else
    {
        activeTimerMenu.innerHTML = "No break timer set. Try timing your break before entering the break space!";
    }
}

function createBreakTimer(totalSecs)
{
    // calculate hours, mins, secs values
    let hours = Math.floor(totalSecs / 3600);
    if (hours < 10) hours = "0" + hours;
    let minutes = Math.floor((totalSecs % 3600) / 60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = totalSecs % 60;
    if (seconds < 10) seconds = "0" + seconds;

    /*** set up new timer div ***/
    let timerDiv = document.createElement("div");
    timerDiv.classList.add("timer-container");
    timerDiv.id = "timer-div";

    // timer values sub-div
    let valuesDiv = document.createElement("div");
    valuesDiv.id = "timer-values";

    let hoursSpan = document.createElement("span");
    hoursSpan.classList.add("hours");
    hoursSpan.innerHTML = hours;

    let minutesSpan = document.createElement("span");
    minutesSpan.classList.add("minutes");
    minutesSpan.innerHTML = minutes;

    let secondsSpan = document.createElement("span");
    secondsSpan.classList.add("seconds");
    secondsSpan.innerHTML = seconds;
    
    let colon1Span = document.createElement("span");
    colon1Span.classList.add("colon");
    colon1Span.innerHTML = ":";
    let colon2Span = colon1Span.cloneNode(true);

    valuesDiv.appendChild(hoursSpan);
    valuesDiv.appendChild(colon1Span);
    valuesDiv.appendChild(minutesSpan);
    valuesDiv.appendChild(colon2Span);
    valuesDiv.appendChild(secondsSpan);
    if (totalSecs == 0)
    {
        valuesDiv.classList.add('timeout');
        addReturnButton();
    }
    timerDiv.appendChild(valuesDiv);

    // add new timer div onto active timer menu
    activeTimerMenu.appendChild(timerDiv);
    /*** end new timer div setup ***/
}

function updateTimer()
{
    let totalSecs = sessionStorage.getItem("break-timer");
    if (totalSecs != 0)
    {
        totalSecs--;
        sessionStorage.setItem("break-timer", totalSecs);

        let timerValues = document.getElementById("timer-values");
        let secsSpan = timerValues.getElementsByClassName("seconds")[0];
        let minsSpan = timerValues.getElementsByClassName("minutes")[0];
        let hrsSpan = timerValues.getElementsByClassName("hours")[0];
        let valueSpans = [ secsSpan, minsSpan, hrsSpan ];
        let i = 0;
        let carryDecrement = true;
        while (carryDecrement)
        {
            let time = parseInt(valueSpans[i].innerHTML, 10);
            time--;

            if (time < 0)
                time = 59;
            else
                carryDecrement = false;

            if (time < 10)
                time = "0" + time;
            
            valueSpans[i].innerHTML = time;

            i++;
        }

        if (totalSecs == 0)
        {
            timerValues.classList.add("timeout");
            // timeout sound effect
            timeoutSound.load();
            timeoutSound.play();

            addReturnButton();
        }
    } // end if
}

function addReturnButton()
{
    returnButton = document.createElement("button");
    returnButton.id = "return-button";
    returnButton.classList.add("button");
    returnButton.classList.add("break-button");
    returnButton.innerHTML = "Return to Study Space";
    returnButton.addEventListener('click', () => { 
        sessionStorage.removeItem("break-timer");
        document.getElementById("study-space-button").click();
    });
    timerContainer.appendChild(returnButton);
}
