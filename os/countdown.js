function getTime() {
    const now = new Date();
    const end = new Date(now.getFullYear()+1, 0, 1, 0, 0);
    const difference = end - now;
    const differenceInSeconds = Math.floor(difference / 1000);
    const countdown = document.getElementById("countdown-text");
    countdown.textContent = differenceInSeconds;
}

setInterval(getTime, 1000);
getTime();