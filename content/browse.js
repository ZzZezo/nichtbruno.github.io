export function createBrowse() {
  const container = document.createElement('div');
  container.id = 'browse-window';
  container.innerHTML = `
    <div class="browse-container">
      <div class="search-container">
        <input type="url" id="browser-url" placeholder="Enter URL...">
        <button id="browse-button" class="browse-button">Search</button>
      </div>
      <iframe id="browser-frame" src="about:blank"></iframe>
    </div>
  `;

  const searchButton = container.querySelector('#browse-button');
  searchButton.addEventListener('click', () => {
    loadUrl();
  });

  const urlInput = container.querySelector('#browser-url');
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadUrl();
    }
  });

  return container;
}

function loadUrl() {
  const url = document.getElementById('browser-url').value;
  const frame = document.getElementById('browser-frame');

  if (url.trim()) {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    frame.src = finalUrl;
  }
}