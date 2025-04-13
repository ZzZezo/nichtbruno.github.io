document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") {
        closeWindow();
    }
});

function closeWindow() {
    window.open("https://google.com", "_self");
}