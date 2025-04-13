import { createDraggableWindow } from "../os/windowManager.js";
import { createJabi } from "./jabi.js";

export function createCDPlayer() {
    const container = document.createElement('div');
    container.id = 'cd-player';
    container.className = 'retro-cd-player';
    container.innerHTML = `
        <div class="cd-body">
            <div class="cd-drive">
                <div class="cd-slot">
                    <div class="cd-disc empty-disc">
                        <div class="cd-reflect"></div>
                        <div class="cd-center"></div>
                        <div class="cd-text"></div>
                        <div class="cd-text-alt"></div>
                    </div>
                </div>
            </div>
           
            <div class="cd-controls">
                <button class="retro-button cd-eject">⏏</button>
                <button class="retro-button cd-play">▶</button>
            </div>
            <div class="cd-games-list"></div> 
        </div>
    `;

    const games = [
        {title: "Jabi", fn: createJabi, width: 800, height: 530, ls: true},
    ];

    const gamesList = container.querySelector('.cd-games-list');
    const playButton = container.querySelector('.cd-play');
    const ejectButton = container.querySelector('.cd-eject');
    const cdDisc = container.querySelector('.cd-disc');
    const cdLabel = container.querySelector('.cd-text');
    const cdLabelAlt = container.querySelector('.cd-text-alt');
    
    let selectedGame = null;
    let isPlaying = false;

    cdDisc.classList.add('empty-disc');

    // Populate game list
    games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'cd-game-item';
        gameItem.innerHTML = `
            <div class="cd-game-icon">💿️</div>
            <div class="cd-game-name">${game.title}</div>
        `;
        
        gameItem.addEventListener('click', () => {
            if (!isPlaying) {
                gamesList.querySelectorAll('.cd-game-item').forEach(item => {
                    item.classList.remove('selected');
                });
                gameItem.classList.add('selected');
                selectedGame = game;
                cdLabel.textContent = game.title.substring(0, 3);
                cdLabelAlt.textContent = game.title.substring(0, 3);
                cdDisc.classList.add('has-disc');
                cdDisc.classList.remove('empty-disc');
            }
        });

        gamesList.appendChild(gameItem);
    });

    // Play button handler
    playButton.addEventListener('click', () => {
        if (!selectedGame) return;
        
        isPlaying = true;
        playButton.style.display = 'none'; // Hide play button
        cdDisc.classList.add('spinning');
        openGameWindow(selectedGame);
    });

    // Eject button handler
    ejectButton.addEventListener('click', () => {
        if (selectedGame != null) {
            gamesList.querySelectorAll('.cd-game-item').forEach(item => {
                item.classList.remove('selected');
            });
            cdDisc.classList.remove('has-disc', 'spinning');
            cdDisc.classList.add('empty-disc');
            cdLabel.textContent = '';
            cdLabelAlt.textContent = '';
            quitGame(selectedGame);
            selectedGame = null;
            isPlaying = false;
            playButton.style.display = 'inline-block';
        }
    });

    return container;
}

function openGameWindow(sg) {
    createDraggableWindow(sg.title, createJabi(), sg.width, sg.height, sg.ls);
}

function quitGame(sg) {
    const game = document.getElementById(sg.title);
    if (game) { 
        game.remove();
    }
}