// Variables for UI elements
var activeTimerMenu = null;
var addTimerButton = null;
var addTimerForm = null;
var labelField = null;
const defaultLabel = "timer";
var hrsField = null;
var minsField = null;
var secsField = null;
var breakCheck = null;
const playSymbol = '<span class="play-symbol material-icons">play_circle_outline</span>';
const pauseSymbol = '<span class="pause-symbol material-icons">pause_circle_outline</span>';
const deleteSymbol = '<span class="delete-symbol material-icons">delete_outline</span>';
const maxNumTimers = 20;
const maxTimeInSecs = 86400; // a day
var numActiveTimers = 0;
var timeoutSound = new Audio("timer-sound.mp3");

// Wait for the DOM to finish loading to add events for buttons
document.addEventListener("DOMContentLoaded", () => {
    timeoutSound.load();

    activeTimerMenu = document.getElementById('active-timer-menu');

    // set up preset timer buttons
    let fiveMinTimerButton = document.getElementById('5min-button');
    fiveMinTimerButton.addEventListener('click', () => { fillTimerFields('00', '05', '00'); } );

    let fifMinTimerButton = document.getElementById('15min-button');
    fifMinTimerButton.addEventListener('click', () => { fillTimerFields('00', '15', '00'); } );

    let thirtyMinTimerButton = document.getElementById('30min-button');
    thirtyMinTimerButton.addEventListener('click', () => { fillTimerFields('00', '30', '00'); } );

    let oneHrTimerButton = document.getElementById('1hr-button');
    oneHrTimerButton.addEventListener('click', () => { fillTimerFields('01', '00', '00'); } );

    let oneHalfHrTimerButton = document.getElementById('1.5hr-button');
    oneHalfHrTimerButton.addEventListener('click', () => { fillTimerFields('01', '30', '00'); } );

    let twoHrTimerButton = document.getElementById('2hr-button');
    twoHrTimerButton.addEventListener('click', () => { fillTimerFields('02', '00', '00'); } );

    // set up add timer button
    addTimerButton = document.getElementById('add-timer-button');

    // set up add-timer form validation
    addTimerForm = document.getElementById('add-timer-form');
    addTimerForm.addEventListener('submit', submitForm)

    // store html fields for timer creation
    labelField = document.getElementById('label-input');
    hrsField = document.getElementById('hours-input');
    minsField = document.getElementById('minutes-input');
    secsField = document.getElementById('seconds-input');

    // store break checkbox
    breakCheck = document.getElementById('break-input');

    // load up existing timers from current session
    numActiveTimers = 0;
    loadTimers();

    // Ensure all active timers are counted down every second
    setInterval(updateTimers, 1000);
});

function loadTimers()
{
    let label = null;
    let timerNum = 1;
    while (label = sessionStorage.getItem("timer-" + timerNum))
    {
        let totalSecs = parseInt(sessionStorage.getItem("timer-" + timerNum + "-seconds"));
        let paused = false;
        if (sessionStorage.getItem("timer-" + timerNum + "-state") == 'paused')
            paused = true;
        createWorkTimer(label, totalSecs, paused);

        timerNum++;
    }

    if (numActiveTimers == maxNumTimers)
    {
        addTimerButton.disabled = true;
    }
}


function updateTimers()
{
    let totalSecs = null;
    let timerNum = 1;
    while (totalSecs = sessionStorage.getItem("timer-" + timerNum + "-seconds"))
    {
        let timerId = "timer-" + timerNum;
        if (sessionStorage.getItem(timerId + "-state") != 'paused' && totalSecs != 0)
        {
            totalSecs--;
            sessionStorage.setItem(timerId + "-seconds", totalSecs);

            let timerValues = document.getElementById(timerId).getElementsByClassName("timer-values");
            if (timerValues.length >= 1)
            {
                let secsSpan = timerValues[0].getElementsByClassName("seconds")[0];
                let minsSpan = timerValues[0].getElementsByClassName("minutes")[0];
                let hrsSpan = timerValues[0].getElementsByClassName("hours")[0];
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
            } // end if for getting timer value div

            if (totalSecs == 0)
            {
                if (timerValues.length >= 1)
                    timerValues[0].classList.add("timeout");

                // timeout sound effect
                timeoutSound.load();
                timeoutSound.play();
            }
        } // end if for updating select timers

        timerNum++;
    } // end while
}


function fillTimerFields(hours, minutes, seconds)
{
    hrsField.value = hours;
    minsField.value = minutes;
    secsField.value = seconds;
}


function submitForm(event)
{
    event.preventDefault();

    let label = labelField.value;
    if (label == '')
        label = defaultLabel;
    let hrs = hrsField.value;
    if (hrs == '')
        hrs = '0';
    let mins = minsField.value;
    if (mins == '')
        mins = '0';
    let secs = secsField.value;
    if (secs == '')
        secs = '0';
    const breakChecked = breakCheck.checked;

    const totalSecs = (parseInt(hrs, 10) * 3600) + (parseInt(mins, 10) * 60) + parseInt(secs, 10);

    // ensure that specified time is within max time allowed
    if (totalSecs > maxTimeInSecs)
    {
        return;
    }

    if (!breakChecked)
    {
        createWorkTimer(label, totalSecs, false);
        addTimerForm.reset();
    }
    else
    {
        createBreakTimer(totalSecs);
    }
}


function createWorkTimer(label, totalSecs, paused)
{
    numActiveTimers++;

    // calculate hours, mins, secs values
    let hours = Math.floor(totalSecs / 3600);
    if (hours < 10) hours = "0" + hours;
    let minutes = Math.floor((totalSecs % 3600) / 60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = totalSecs % 60;
    if (seconds < 10) seconds = "0" + seconds;

    // store timer in sessionStorage
    let storageName = "timer-" + numActiveTimers;
    sessionStorage.setItem(storageName, label);
    sessionStorage.setItem(storageName+'-seconds', totalSecs);
    if (paused)
        sessionStorage.setItem(storageName+'-state', 'paused');
    else
        sessionStorage.setItem(storageName+'-state', 'unpaused');

    /*** set up new timer div ***/
    let timerDiv = document.createElement("div");
    timerDiv.classList.add("timer-container");
    timerDiv.id = storageName;

    // timer controls sub-div
    let controlsDiv = document.createElement("div");
    controlsDiv.classList.add("timer-controls");

        // play/pause button
    let pauseButton = document.createElement("button");
    let pSymbol = document.createElement("span");
    pSymbol.classList.add("material-icons");
    if (paused)
        pSymbol.innerHTML = "play_circle_outline";
    else
        pSymbol.innerHTML = "pause_circle_outline";
    pauseButton.appendChild(pSymbol);
    pauseButton.classList.add("timer-control-button");
    pauseButton.classList.add("timer-pause-button");
    pauseButton.id = "" + numActiveTimers + "-pause-button";
    pauseButton.addEventListener('click', () => { pauseTimer(pauseButton); } );
    controlsDiv.appendChild(pauseButton);

        // delete button
    let delButton = document.createElement("button");
    delButton.innerHTML = deleteSymbol;
    delButton.classList.add("timer-control-button");
    delButton.classList.add("timer-delete-button");
    delButton.id = "" + numActiveTimers + "-delete-button";
    delButton.addEventListener('click', () => { deleteTimer(delButton); } );
    controlsDiv.appendChild(delButton);

    timerDiv.appendChild(controlsDiv);

    // label
    let labelDiv = document.createElement("div");
    labelDiv.classList.add("timer-label");
    labelDiv.innerHTML = label;
    timerDiv.appendChild(labelDiv);

    // timer values sub-div
    let valuesDiv = document.createElement("div");
    valuesDiv.classList.add("timer-values");

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
        valuesDiv.classList.add('timeout');
    timerDiv.appendChild(valuesDiv);

    // add new timer div onto active timer menu
    activeTimerMenu.appendChild(timerDiv);
    /*** end new timer div setup ***/

    if (numActiveTimers == maxNumTimers)
    {
        addTimerButton.disabled = true;
    }
}


function pauseTimer(pauseButton)
{
    let timerNum = parseInt(pauseButton.id);
    let paused = false;

    if (pauseButton.firstElementChild.innerHTML == "play_circle_outline") // previously paused, so unpause timer
    {
        pauseButton.firstElementChild.innerHTML = "pause_circle_outline";
        paused = false;
    }
    else if (pauseButton.firstElementChild.innerHTML == "pause_circle_outline") // previously unpaused, so pause timer
    {
        pauseButton.firstElementChild.innerHTML = "play_circle_outline";
        paused = true;
    }

    // update timer's state in storage
    if (sessionStorage.getItem("timer-" + timerNum + "-state") != null)
    {
        if (paused)
            sessionStorage.setItem("timer-" + timerNum + "-state", 'paused');
        else
            sessionStorage.setItem("timer-" + timerNum + "-state", 'unpaused');
    }
}


function deleteTimer(delButton)
{
    let timerNum = parseInt(delButton.id);
    numActiveTimers--;
    addTimerButton.disabled = false;

    // shift stored timer data down by 1 index
    for (let i = timerNum; i <= numActiveTimers; i++)
    {
        sessionStorage.setItem( "timer-" + i, sessionStorage.getItem("timer-" + (i+1)) )
        sessionStorage.setItem( "timer-" + i + "-seconds", sessionStorage.getItem("timer-" + (i+1) + "-seconds") );
        sessionStorage.setItem( "timer-" + i + "-state", sessionStorage.getItem("timer-" + (i+1) + "-state") );
    }

    // delete left-over set of timer data at the last timer index
    sessionStorage.removeItem("timer-" + (numActiveTimers + 1));
    sessionStorage.removeItem("timer-" + (numActiveTimers + 1) + "-seconds");
    sessionStorage.removeItem("timer-" + (numActiveTimers + 1) + "-state");

    // remove the target timer's div from the page
    let timerDivs = activeTimerMenu.getElementsByClassName("timer-container");
    if (timerDivs.length >= timerNum)
    {
        timerDivs[timerNum - 1].remove();
    }

    // update timer numbers in the id's of the timer control buttons
    for (let i = timerNum + 1; i <= numActiveTimers + 1; i++)
    {
        document.getElementById("timer-" + i).id = "timer-" + (i-1);
        document.getElementById("" + i + "-pause-button").id = "" + (i-1) + "-pause-button";
        document.getElementById("" + i + "-delete-button").id = "" + (i-1) + "-delete-button";
    }    
}


function createBreakTimer(totalSecs)
{
    sessionStorage.setItem("break-timer", totalSecs);
    document.getElementById("study-break-button").click();
}