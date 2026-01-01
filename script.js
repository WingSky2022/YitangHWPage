document.addEventListener('DOMContentLoaded', () => {
    // Character Count Logic
    // Toolbar Button Logic (State Sync)
    // Toolbar Button Logic (State Sync & Action)
    const toolbarButtons = document.querySelectorAll('.toolbar-container button[data-format]');

    // Bind Click Events centrally
    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const format = btn.getAttribute('data-format');
            if (!format) return;

            // Prevent default button behavior
            e.preventDefault();

            // Heading Toggle Logic
            if (['h1', 'h2', 'h3'].includes(format)) {
                const currentBlock = document.queryCommandValue('formatBlock');
                if (currentBlock && currentBlock.toLowerCase() === format) {
                    // Toggle Off -> P
                    document.execCommand('formatBlock', false, 'P');
                } else {
                    document.execCommand('formatBlock', false, format.toUpperCase());
                }
            }
            // Highlight Logic
            else if (format === 'highlight') {
                execHighlight();
            }
            // Standard Commands
            else if (format === 'bold') document.execCommand('bold');
            else if (format === 'italic') document.execCommand('italic');
            else if (format === 'ul') document.execCommand('insertUnorderedList');
            else if (format === 'ol') document.execCommand('insertOrderedList');

            // Force state update
            updateToolbarState();
        });
    });

    const updateToolbarState = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const isCollapsed = selection.isCollapsed;

        // Simple check for command state
        toolbarButtons.forEach(btn => {
            const format = btn.getAttribute('data-format');
            let isActive = false;

            // Heading & Lists are context-sensitive (always show if cursor inside)
            if (['h1', 'h2', 'h3'].includes(format)) {
                const blockValue = document.queryCommandValue('formatBlock');
                isActive = blockValue && blockValue.toLowerCase() === format;
            }
            else if (format === 'ul') isActive = document.queryCommandState('insertUnorderedList');
            else if (format === 'ol') isActive = document.queryCommandState('insertOrderedList');

            // Inline Styles: User requires them OFF if no text selected
            else if (['bold', 'italic', 'highlight'].includes(format)) {
                if (isCollapsed) {
                    isActive = false; // "光标未选中对应字体时...应不会亮起来"
                } else {
                    if (format === 'bold') isActive = document.queryCommandState('bold');
                    else if (format === 'italic') isActive = document.queryCommandState('italic');
                    else if (format === 'highlight') {
                        // Custom highlight check
                        let parent = selection.anchorNode;
                        if (parent && parent.nodeType === 3) parent = parent.parentNode;
                        while (parent && parent.classList && !parent.classList.contains('ql-editor')) {
                            if (parent.nodeName === 'MARK' ||
                                (parent.style && (parent.style.backgroundColor === 'rgb(254, 240, 138)' || parent.style.backgroundColor === '#fef08a'))) {
                                isActive = true;
                                break;
                            }
                            parent = parent.parentNode;
                        }
                    }
                }
            }

            if (isActive) btn.classList.add('active-tool');
            else btn.classList.remove('active-tool');
        });
    };

    // Listen for selection changes
    document.addEventListener('selectionchange', updateToolbarState);
    editors.forEach(editor => {
        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('mouseup', updateToolbarState);
        // Note: click listeners on editor might be redundant with selectionchange
    });

    // Image Upload Logic (Multi-instance)
    const imageBtns = document.querySelectorAll('.btn-image-upload');
    imageBtns.forEach(btn => {
        const toolbar = btn.closest('.toolbar-container');
        if (!toolbar) return;
        const input = toolbar.querySelector('.image-upload-input');
        if (!input) return;

        btn.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    document.execCommand('insertImage', false, base64);
                };
                reader.readAsDataURL(file);
            }
            input.value = '';
        });
    });

    // Fullscreen Toggle Logic (Target HW Container)
    const fullscreenBtns = document.querySelectorAll('.btn-fullscreen');
    fullscreenBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Target the Homework Wrapper (contains Title, Desc, Editor)
            // Hierarchy: btn -> .toolbar-container -> .border... -> .px-6 (Wrapper)
            const wrapper = btn.closest('.border')?.parentElement;
            if (wrapper) {
                toggleFullscreen(wrapper, btn);
            }
        });
    });
});

function toggleFullscreen(container, btn) {
    const isFullscreen = container.classList.toggle('fullscreen-mode');
    const icon = btn.querySelector('.material-icons-round');

    if (isFullscreen) {
        icon.textContent = 'fullscreen_exit';
        document.body.style.overflow = 'hidden';
    } else {
        icon.textContent = 'fullscreen';
        document.body.style.overflow = '';
    }
}

// Highlight Function for Toolbar Button
function execHighlight() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // If no text selected, do nothing
    if (!selectedText.length) return;

    // Check if we are already inside a MARK tag
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === 3) parent = parent.parentNode; // Text node -> Element

    if (parent.nodeName === 'MARK') {
        // Unwrap if already highlighted
        const text = document.createTextNode(parent.textContent);
        parent.parentNode.replaceChild(text, parent);
    } else {
        // Wrap in MARK
        try {
            const mark = document.createElement('mark');
            mark.textContent = selectedText;
            range.deleteContents();
            range.insertNode(mark);
        } catch (e) {
            console.warn('Highlight failed (likely cross-block selection):', e);
            document.execCommand('hiliteColor', false, '#fef08a');
        }
    }
    // Update toolbar state immediately
    setTimeout(() => {
        const evt = new Event('selectionchange');
        document.dispatchEvent(evt);
    }, 0);
}
