export function createChangelog() {
    const container = document.createElement('div');
    container.id = 'changelog';
    container.className = 'retro-scrollable';
    container.innerHTML = `
        <div class="changelog-content">
            <h3 class="dos-heading">SYSTEM CHANGELOG</h3>
            <div class="scroll-view">
                <!-- Entries will be added here -->
            </div>
        </div>
    `;

    // Array now supports multiline entries
    const entries = [
        {
            date: '03.05.25',
            text: `V3.2.1
                - Updated controls for the ping pong game.
                - Added a Flo-mode to the jump n run!`
        },
        {
            date: '14.04.25',
            text: `V3.2.0
                - Added a new Game! ENJOY! 🚀
                - Added an emergency Button 🚨 Press 'f' to exit the webiste (Hakons Idee)`
        },
        {
            date: '13.04.25',
            text: `V3.1.0.b
                Here are the changes that have been made on this day:
                --- FUNCTIONALITY ---  
                - Improved desktop functionality and performance  

                --- GALLERY ---  
                - Redesigned Gallery interface for a modern experience  
                - Added ability to upload custom wallpapers  
                - New "Fit" option for wallpaper scaling  
                - Toggle visibility of the "BrunOS" text on/off  

                --- CHANGELOG ---  
                - Introduced this changelog system  

                --- CD PLAYER ---  
                - Added CD Player to launch retired/classic games  
                - Select a game and press "Play" to start  
                - Use "Eject" to close games after playing  
                - Preserves older titles without cluttering the desktop`
        },
    ];

    const scrollView = container.querySelector('.scroll-view');
    
    entries.forEach(entry => {
        const line = document.createElement('div');
        line.className = 'log-entry';
        line.innerHTML = `
            <span class="log-date">${entry.date}:</span>
            <div class="log-text">${entry.text.replace(/\n/g, '<br>')}</div>
        `;
        scrollView.appendChild(line);
    });

    return container;
}