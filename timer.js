// Variables for UI elements.
let timerTable = null;
let addTimerButton = null;

// Wait for the DOM to finish loading to add events for the buttons.
document.addEventListener("DOMContentLoaded", () => {
    addTimerButton = document.getElementById("add-timer-5min");
    timerTable = document.getElementById("timer-table");

    addTimerButton.addEventListener("click", () => { addTimer("timer", 0, 5, 0) });
});

// https://www.youtube.com/watch?v=x7WJEmxNlEs
const maxNumTimers = 5;
const maxTimeInSecs = 86400; // a day
var numActiveTimers = 0;
const numCols = 4;

setInterval(updateTimer, 1000);

function updateTimer()
{
    for (var i = 2, row; row = timerTable.rows[i]; i++)
    {
        var timeOut = true;
        for (var j = row.cells.length-1, col; (col = row.cells[j]) && j > 0; j--)
        {
            if (parseInt(col.innerHTML) > 0)
            {
                timeOut = false;
                break;
            }
        }
        if (timeOut) continue;

        var decrementNextColOver = true;
        for (var j = row.cells.length-1, col; (col = row.cells[j]) && j > 0; j--)
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

        timerTable.insertRow(numActiveTimers+2);
        const newRow = timerTable.rows[numActiveTimers+2];
        newRow.className = "timer-table-row";

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
                    newCell.className = "timer-table-row-name";
                    newCell.innerHTML = name;
                    break;
                case 1:
                    newCell.innerHTML = hours;
                    break;
                case 2:
                    newCell.innerHTML = minutes;
                    break;
                case 3:
                    newCell.innerHTML = seconds;
                    break;
                default:
                    break;                    
            }
        }

        if (numActiveTimers == maxNumTimers)
        {
            addTimerButton.disabled = true;
        }
    }
}

function stopTimer(index)
{

}

function resumeTimer(index)
{

}

function deleteTimer(index)
{
    if (index >= 2 && index < numActiveTimers + 2)
    {

        numActiveTimers--;
        addTimerButton.disabled = false;
    }
}
