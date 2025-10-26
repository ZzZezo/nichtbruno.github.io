export function generateShortcuts() {
    for (const key in data) {
        createShortcut(key);
    }
}

function createShortcut(key) {
    if (data.hasOwnProperty(key)) {
        const entry = data[key];
        const div = document.createElement('div');
        const itemPos = gridToPos(entry.grid);

        div.innerHTML = `
        <img src="/assets/images/shortcuts/${entry.image}">
        <span>${entry.name}</span>
        `;

        div.id = entry.id;
        div.className = "shortcut";
        div.style.left = `${itemPos[0]}px`;
        div.style.top = `${itemPos[1]}px`;

        document.body.appendChild(div);
    }
}

function gridToPos(grid) {
    const pos = [0, 0];
    const paddingX = 30;
    const paddingY = 30;
    const size = 50;

    pos[0] = (paddingX * grid[1]) + (size * (grid[1]-1));
    pos[1] = ((window.innerHeight - size - paddingY) * grid[2]) - ((paddingY * grid[0]) + (size * (grid[0]-1)));
    pos[1] = Math.abs(pos[1]);

    return pos;
}

const data = {
    "about": {
        "name": "About",
        "image": "infoicon.png",
        "id": "about",
        "grid": [1, 1, 0], // row, col, allignment (0: top, 1: bottom)
    },
    "gallery": {
        "name": "Gallery",
        "image": "gallery.png",
        "id": "gallery",
        "grid": [1, 2, 0],
    },
    "cc": {
        "name": "LICENSE",
        "image": "cc.png",
        "id": "license",
        "grid": [1, 3, 0],
    },
    "github": {
        "name": "GitHub",
        "image": "github.png",
        "id": "github",
        "grid": [1, 4, 0],
    },
    "timer": {
        "name": "Timer",
        "image": "timer.png",
        "id": "timer",
        "grid": [2, 1, 0],
    },
    "clock": {
        "name": "Clock",
        "image": "clock.png",
        "id": "clock",
        "grid": [2, 2, 0],
    },
    "browse": {
        "name": "Browse",
        "image": "lupe.png",
        "id": "browse",
        "grid": [2, 3, 0],
    },
    "pingpong": {
        "name": "Ping Pong",
        "image": "pingpong.png",
        "id": "pingpong",
        "grid": [3, 1, 0],
    },
    // "firepong": {
    //     "name": "Fire Pong",
    //     "image": "firepong.png",
    //     "id": "firepong",
    //     "grid": [3, 1, 0],
    // },
    "jumpnrun": {
        "name": "Holy Jump",
        "image": "jumpnrun.png",
        "id": "jumpnrun",
        "grid": [3, 2, 0],
    },
}