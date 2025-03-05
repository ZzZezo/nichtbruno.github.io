export function createListContent() {
    const listContainer = document.createElement('ul');
    listContainer.innerHTML = `
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    `;
    return listContainer;
}