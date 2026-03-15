export function createTimer() {
    const container = document.createElement('div');
    container.id = 'timer-container';
    container.innerHTML = `
        <div id="timer" class="timer-box">
            <div class="timer-control">
                <form class="timer-form">
                    <div>
                        <label for="year">Year</label>
                        <select id="year" name="year"></select>
                    </div>
                    <div>
                        <label for="month">Month</label>
                        <select id="month" name="month"></select>
                    </div>
                    <div>
                        <label for="day">Day</label>
                        <select id="day" name="day"></select>
                    </div>
                    <div>
                        <label for="hour">Hour</label>
                        <select id="hour" name="hour"></select>
                    </div>
                    <div>
                        <label for="minute">Minute</label>
                        <select id="minute" name="minute"></select>
                    </div>
                </form>
                <button id="start-timer" class="retro-button">Start</button>
            </div>
            <div id="countdown" class="countdown-container">
                <div class="timer-countdown-box">
                    <h3 id="timer-countdown-text" class="timer-countdown-text">00</h3>
                </div>
            </div>
        </div>
    `;

    startTimer(container);

    const startButton = container.querySelector('#start-timer');
    startButton.addEventListener('click', () => {
        getMyDate(container);
        startCountdown(container);
    });

    return container;
}

let mydate = {
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
};

let countdownInterval = null;

function getMyDate(container) {
    mydate.year = parseInt(container.querySelector('#year').value);
    mydate.month = parseInt(container.querySelector('#month').value) - 1;
    mydate.day = parseInt(container.querySelector('#day').value);
    mydate.hour = parseInt(container.querySelector('#hour').value);
    mydate.minute = parseInt(container.querySelector('#minute').value);
}

function startTimer(container) {
    const today = new Date();

    function populateYears() {
        const yearSelect = container.querySelector('#year');
        const currentYear = new Date().getFullYear();
    
        for (let i = 2000; i <= currentYear + 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }

        yearSelect.value = today.getFullYear();
        mydate.year = yearSelect.value;
    }

    function populateMonths() {
        const monthSelect = container.querySelector('#month');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            monthSelect.appendChild(option);
        });

        monthSelect.value = today.getMonth() + 1;
        mydate.month = monthSelect.value - 1;
    }

    function populateDays() {
        const daySelect = container.querySelector('#day');
        daySelect.innerHTML = '';
    
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }

        daySelect.value = today.getDate();
        mydate.day = daySelect.value;
    }

    function populateHours() {
        const hourSelect = container.querySelector('#hour');
        hourSelect.innerHTML = '';
    
        for (let i = 0; i < 24; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = String(i).padStart(2, '0');
            hourSelect.appendChild(option);
        }

        hourSelect.value = today.getHours();
        mydate.hour = hourSelect.value;
    }

    function populateMinutes() {
        const minuteSelect = container.querySelector('#minute');
        minuteSelect.innerHTML = '';
    
        for (let i = 0; i < 60; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = String(i).padStart(2, '0');
            minuteSelect.appendChild(option);
        }

        minuteSelect.value = today.getMinutes();
        mydate.minute = minuteSelect.value;
    }
    
    populateYears();
    populateMonths();
    populateDays();
    populateHours();
    populateMinutes();
}

function formatTime(seconds) {
    return String(seconds).padStart(2, '0');
}

function startCountdown(container) {
    const timerCountdownDisplay = container.querySelector('.timer-countdown-text');
    if (!timerCountdownDisplay) {
        console.error('Countdown display element not found!');
        return;
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    timerCountdownDisplay.classList.remove('expired');

    function getTime() {
        const now = new Date();
        const end = new Date(mydate.year, mydate.month, mydate.day, mydate.hour, mydate.minute);
        const difference = end - now;
        const differenceInSeconds = Math.floor(difference / 1000);

        if (differenceInSeconds <= 0) {
            timerCountdownDisplay.textContent = '00';
            timerCountdownDisplay.classList.add('expired');
            clearInterval(countdownInterval);
            return;
        }

        timerCountdownDisplay.textContent = formatTime(differenceInSeconds);
    }

    getTime();
    countdownInterval = setInterval(getTime, 1000);
}