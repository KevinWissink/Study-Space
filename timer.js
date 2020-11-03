// Tutorial used to setup table and create countdowns: https://www.youtube.com/watch?v=x7WJEmxNlEs

// Variables for UI elements
let timerTable = null;
var addTimerButtons = [];
let fiveMinTimerButton = null;
let fifMinTimerButton = null;
let thirtyMinTimerButton = null;
let oneHrTimerButton = null;
let oneHalfHrTimerButton = null;
let twoHrTimerButton = null;
const playText = '&#9654;';
const playSymbol = '▶';
const pauseText = '&#10074;&#10074;';
const pauseSymbol = '❚❚';

// Wait for the DOM to finish loading to add events for buttons
document.addEventListener("DOMContentLoaded", () => {
    timerTable = document.getElementById("timer-table");

    // set up add-timer buttons
    fiveMinTimerButton = document.getElementById('5min-button');
    fiveMinTimerButton.addEventListener('click', () => { addTimer('5 min', 0, 5, 0); } );
    addTimerButtons.push(fiveMinTimerButton);

    fifMinTimerButton = document.getElementById('15min-button');
    fifMinTimerButton.addEventListener('click', () => { addTimer('15 min', 0, 15, 0); } );
    addTimerButtons.push(fifMinTimerButton);

    thirtyMinTimerButton = document.getElementById('30min-button');
    thirtyMinTimerButton.addEventListener('click', () => { addTimer('30 min', 0, 30, 0); } );
    addTimerButtons.push(thirtyMinTimerButton);

    oneHrTimerButton = document.getElementById('1hr-button');
    oneHrTimerButton.addEventListener('click', () => { addTimer('1 hr', 1, 0, 0); } );
    addTimerButtons.push(oneHrTimerButton);

    oneHalfHrTimerButton = document.getElementById('1.5hr-button');
    oneHalfHrTimerButton.addEventListener('click', () => { addTimer('1.5 hr', 1, 30, 0); } );
    addTimerButtons.push(oneHalfHrTimerButton);

    twoHrTimerButton = document.getElementById('2hr-button');
    twoHrTimerButton.addEventListener('click', () => { addTimer('2 hr', 2, 0, 0); } );
    addTimerButtons.push(twoHrTimerButton);
});

// Structure of Timer Menu/Table
const maxNumTimers = 5;
const maxTimeInSecs = 86400; // a day
var numActiveTimers = 0;
const headerRows = 2;
const footerRows = 0;
const numCols = 8;
const headerCols = 3;
const playButtColIndex = 0;

// Ensure all active timers are counted down every second
setInterval(updateTimers, 1000);

function updateTimers()
{
    for (var i = headerRows, row; (row = timerTable.rows[i]) && (i < timerTable.rows.length - footerRows); i++)
    {
        if (row.cells[playButtColIndex].firstChild.innerHTML == playSymbol)
        {
            continue;
        }

        var timeOut = true;
        for (var j = row.cells.length-1, col; (j > headerCols - 1) && (col = row.cells[j]); j = j - 2)
        {
            if (parseInt(col.innerHTML) > 0)
            {
                timeOut = false;
                break;
            }
        }
        if (timeOut)
        {
            row.classList.add("timeout");
            continue;
        }

        var decrementNextColOver = true;
        for (var j = row.cells.length-1, col; (j > headerCols - 1) && (col = row.cells[j]); j = j - 2)
        {
            col = parseInt(col.innerHTML, 10);
            col--;

            if (col < 0) col = 59;
            else decrementNextColOver = false;

            if (col < 10) col = "0" + col;

            row.cells[j].innerHTML = col;

            if (!decrementNextColOver) break;
        }
    }
}

function addTimer(name, hours, mins, secs)
{
    const totalSecs = (hours * 3600) + (mins * 60) + secs;
    if (numActiveTimers < maxNumTimers && totalSecs <= maxTimeInSecs)
    {
        numActiveTimers++;

        const newRow = timerTable.insertRow(numActiveTimers+1);
        newRow.classList.add("timer-table-timer-row");

        let hours = Math.floor(totalSecs / 3600);
        if (hours < 10) hours = "0" + hours;
        let minutes = Math.floor((totalSecs % 3600) / 60);
        if (minutes < 10) minutes = "0" + minutes;
        let seconds = totalSecs % 60;
        if (seconds < 10) seconds = "0" + seconds;

        for (var i = 0; i < numCols; i++)
        {
            let newCell = newRow.insertCell(i);
            switch(i)
            {
                case 0:
                    let playButton = document.createElement("BUTTON");
                    playButton.innerHTML = pauseText;
                    playButton.classList.add("button");
                    playButton.classList.add("control-timer-button");
                    playButton.addEventListener('click', () => { playPauseTimer(playButton); } );
                    newCell.appendChild(playButton);
                    break;
                case 1:
                    let delButton = document.createElement("BUTTON");
                    delButton.innerHTML = '<i class="material-icons">delete</i>';
                    delButton.classList.add("button");
                    delButton.classList.add("control-timer-button");
                    delButton.addEventListener('click', () => { deleteTimer(delButton); } );
                    newCell.appendChild(delButton);
                    break;
                case 2:
                    newCell.classList.add("timer-table-timer-row-name");
                    newCell.innerHTML = name;
                    break;
                case 3:
                    newCell.classList.add("timer-table-timer-row-value");
                    newCell.innerHTML = hours;
                    break;
                case 4:
                    newCell.innerHTML = ':';
                    break;
                case 5:
                    newCell.classList.add("timer-table-timer-row-value");
                    newCell.innerHTML = minutes;
                    break;
                case 6:
                    newCell.innerHTML = ':';
                    break;
                case 7:
                    newCell.classList.add("timer-table-timer-row-value");
                    newCell.innerHTML = seconds;
                    break;
                default:
                    break;                    
            }
        }

        if (numActiveTimers == maxNumTimers)
        {
            for (var i = 0; i < addTimerButtons.length; i++)
            {
                addTimerButtons[i].disabled = true;
            }
        }
    }
}

function playPauseTimer(playButton)
{
    if (playButton.innerHTML == playSymbol) // currently paused, so resume timer
    {
        playButton.innerHTML = pauseText;
    }
    else if (playButton.innerHTML == pauseSymbol) // currently counting, so pause timer
    {
        playButton.innerHTML = playText;
    }
}

function deleteTimer(delButton)
{
    numActiveTimers--;
    for (var i = 0; i < addTimerButtons.length; i++)
    {
        addTimerButtons[i].disabled = false;
    }

    delButton.closest('tr').remove();
}
