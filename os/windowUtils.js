export function makeDraggable(elements) {
    elements.forEach(el => {
        let active = false;
        let initialX, initialY;

        // check grab el or window header
        const dragHandle = el.classList.contains('window') ? el.querySelector('.window-header') : el;

        if (!dragHandle) return;

        dragHandle.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);

        function startDragging(e) {
            active = true;
            initialX = e.clientX - el.offsetLeft;
            initialY = e.clientY - el.offsetTop;
        }

        function drag(e) {
            if (!active) return;

            e.preventDefault();
            el.style.left = `${e.clientX - initialX}px`;
            el.style.top = `${e.clientY - initialY}px`;
        }

        function stopDragging() {
            active = false;
        }

        el._dragHandlers = {startDragging, drag, stopDragging};

        dragHandle.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    });
}

export function cleanupDraggable(element) {
    if (element._dragHandlers) {
        const { startDragging, drag, stopDragging } = element._dragHandlers;
        const dragHandle = element.classList.contains('window') ? element.querySelector('.window-header') : element;
        
        if (dragHandle) {
            dragHandle.removeEventListener('mousedown', startDragging);
        }
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
        delete element._dragHandlers;
    }
}

export function makeResizable(el, minHeight = 100, minWidth = 100) {
    const resizeHandleSize = 7;
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.width = `${resizeHandleSize}px`;
    resizeHandle.style.height = `${resizeHandleSize}px`;
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.backgroundColor = 'rgb(8, 13, 39)';
    resizeHandle.style.cursor = 'se-resize';
    el.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = el.offsetWidth;
        startHeight = el.offsetHeight;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            if (newWidth > minWidth) el.style.width = `${newWidth}px`;
            if (newHeight > minHeight) el.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
}