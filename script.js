document.addEventListener('DOMContentLoaded', () => {
    // Character Count Logic
    // Toolbar Button Logic (State Sync)
    // Toolbar Button Logic (State Sync & Action)
    const toolbarButtons = document.querySelectorAll('.toolbar-container button[data-format]');
    const editors = document.querySelectorAll('.ql-editor');


    // State for Image Upload targeting
    let currentUploadEditor = null;

    // Global Event Delegation for Toolbar Actions
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Disable native object resizing for better custom handling
        try {
            document.execCommand('enableObjectResizing', false, false);
        } catch (e) { }

        // 1. Handle Standard Formatting Buttons
        const fmtBtn = target.closest('button[data-format]');
        if (fmtBtn) {
            e.preventDefault();
            const format = fmtBtn.getAttribute('data-format');

            // Heading Toggle Logic
            if (['h1', 'h2', 'h3'].includes(format)) {
                const currentBlock = document.queryCommandValue('formatBlock');
                if (currentBlock && currentBlock.toLowerCase() === format) {
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

            updateToolbarState();
            return;
        }

        // 2. Handle Image Upload Buttons
        const imgBtn = target.closest('.btn-image-upload');
        if (imgBtn) {
            e.preventDefault();
            const toolbar = imgBtn.closest('.toolbar-container');
            if (toolbar) {
                // Find associated editor
                // Toolbar is .bg-gray-50... sibling to .relative > .ql-editor
                const wrapper = toolbar.parentElement; // .border...
                const editor = wrapper.querySelector('.ql-editor');
                currentUploadEditor = editor;

                const input = toolbar.querySelector('.image-upload-input');
                if (input) input.click();
            }
            return;
        }

        // 3. Handle Fullscreen Buttons
        const fsBtn = target.closest('.btn-fullscreen');
        if (fsBtn) {
            e.preventDefault();
            const toolbar = fsBtn.closest('.toolbar-container');
            // Hierarchy: toolbar -> wrapper -> parent -> q block
            const wrapper = toolbar?.parentElement?.parentElement;

            if (wrapper) {
                toggleFullscreen(wrapper, fsBtn);
            }
            return;
        }
    });

    // Image Input Change Listener
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('image-upload-input')) {
            const input = e.target;
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Restore focus to specific editor
                    if (currentUploadEditor) {
                        currentUploadEditor.focus();
                        // Optional: Move cursor to end if no selection? 
                        // execCommand uses current selection. If focus() restores last selection in that element, good.
                        // If not, we might need to create a range at end.
                        // Standard behavior: focus() usually puts cursor at beginning or restores last state.

                        // Safety: Ensure we don't overwrite if user clicked elsewhere.
                        document.execCommand('insertImage', false, event.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
            input.value = '';
        }
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



    // Character Count Logic
    const MAX_CHARS = 20000;
    document.querySelectorAll('.editor-content').forEach(editor => {
        // Find counter display (absolute positioned sibling)
        const wrapper = editor.parentElement;
        const counter = wrapper ? wrapper.querySelector('.text-xs') : null; // "5/20000"

        const updateCount = () => {
            let text = editor.innerText || '';
            // Remove zero-width spaces that might be added by editor
            text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
            let count = text.length;

            if (count > MAX_CHARS) {
                // Truncate logic (Safe approach: Alert user, prevent add? 
                // Truncating innerText directly in contenteditable is risky for cursor/formatting.
                // Simple approach: Delete extra chars from end is hard. 
                // Let's just Clamp the display and maybe warn visually for now, 
                // enforcing strict limit via 'beforeinput' is better).

                // Strict Limit:
                // We will try to prevent input if full.
                // But for pasting, we might need truncation.
                // Let's stick to visual warning + text blocking first.
                count = MAX_CHARS;
                counter.style.color = 'red';
            } else {
                counter.style.color = '';
            }

            if (counter) counter.textContent = `${count}/${MAX_CHARS}`;
        };

        // Init
        updateCount();

        editor.addEventListener('input', (e) => {
            let text = editor.innerText || '';
            text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

            if (text.length > MAX_CHARS) {
                // Revert is hard. Let's just warn. 
                // Or try to slice textContent? (Destroys HTML). 
                // User said "limit".
                // Detailed Ref implementation usually does text length slicing but preserves HTML is hard.
                // Let's rely on event prevention.
            }
            updateCount();
        });

        // Prevent input if over limit (except delete keys)
        editor.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;

            let text = editor.innerText.replace(/[\u200B-\u200D\uFEFF]/g, '');
            if (text.length >= MAX_CHARS) {
                e.preventDefault();
                // Flash counter red
                if (counter) {
                    counter.style.color = 'red';
                    setTimeout(() => counter.style.color = '', 200);
                }
            }
        });
    });

    // Image Resizer Logic
    // Create Globals
    let activeImage = null;
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    let activeHandle = null;

    // Create Resizer DOM
    const resizerOverlay = document.createElement('div');
    resizerOverlay.className = 'resizer-overlay';
    resizerOverlay.innerHTML = `
        <div class="resizer-handle handle-nw" data-dir="nw"></div>
        <div class="resizer-handle handle-ne" data-dir="ne"></div>
        <div class="resizer-handle handle-sw" data-dir="sw"></div>
        <div class="resizer-handle handle-se" data-dir="se"></div>
    `;
    document.body.appendChild(resizerOverlay);

    const updateResizerPosition = () => {
        if (!activeImage) {
            resizerOverlay.style.display = 'none';
            return;
        }
        const rect = activeImage.getBoundingClientRect();
        // Account for scroll
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        resizerOverlay.style.width = rect.width + 'px';
        resizerOverlay.style.height = rect.height + 'px';
        resizerOverlay.style.left = (rect.left + scrollX) + 'px';
        resizerOverlay.style.top = (rect.top + scrollY) + 'px';
        resizerOverlay.style.display = 'block';
    };

    // Listeners for Image Interaction
    // 1. Click on Image to Activate
    document.addEventListener('click', (e) => {
        // If clicking resizer handle, ignore (handled by mousedown)
        if (e.target.closest('.resizer-handle')) return;

        if (e.target.tagName === 'IMG' && e.target.closest('.ql-editor')) {
            activeImage = e.target;
            updateResizerPosition();
            // Optional: Select the image in editor (native behavior)
        } else {
            // Click outside -> Hide
            activeImage = null;
            updateResizerPosition();
        }
    });

    // 2. Handle Resizing
    resizerOverlay.querySelectorAll('.resizer-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            if (!activeImage) return;
            e.preventDefault(); // Prevent text selection
            e.stopPropagation();

            isResizing = true;
            activeHandle = e.target.getAttribute('data-dir');
            startX = e.clientX;
            startY = e.clientY;
            startWidth = activeImage.offsetWidth; // Use offsetWidth to ignore transform scale for calculation base
            startHeight = activeImage.offsetHeight; // or naturalHeight ratio lock?

            // Global move/up listeners
            document.addEventListener('mousemove', onResize);
            document.addEventListener('mouseup', endResize);
        });
    });

    const onResize = (e) => {
        if (!isResizing || !activeImage) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        // Simple resizing logic (aspect ratio lock recommended but free-form for now)
        // Or Shift-key for ratio? Let's default to free-form or ratio-lock based on corners.
        // Usually, corner drag implies ratio lock for images, but free form is also common.
        // Let's implement free form for flexibility, but maybe lock ratio if it's se/nw?
        // User said "Square black dots", typical behavior.

        // Let's try Standard Free Resize first.
        // Actually, for HTML images, Aspect Ratio is usually preserved if you only set Width OR Height.
        // If we set both, we distort.
        // Best Practice: Resize Width, let Height auto.

        if (activeHandle.includes('e')) newWidth = startWidth + dx;
        if (activeHandle.includes('w')) newWidth = startWidth - dx;

        // Apply min size
        if (newWidth < 50) newWidth = 50;

        // Apply
        activeImage.style.width = newWidth + 'px';
        activeImage.removeAttribute('height'); // Allow Auto height
        // activeImage.style.height = 'auto'; 

        updateResizerPosition();
    };

    const endResize = () => {
        isResizing = false;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', endResize);
    };

    // 3. Update position on Scroll/Resize
    window.addEventListener('resize', updateResizerPosition);
    window.addEventListener('scroll', updateResizerPosition, true); // Capture phase for all scrolling elements

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

// --- Tabbed Interface Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Delegate click for tab buttons
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (!tabBtn) return;

        e.preventDefault(); // Prevent default if any

        const targetId = tabBtn.getAttribute('data-tab');
        if (!targetId) return;

        // Find the Tabs Container (Parent of the buttons wrapper)
        // Structure: div.rounded-xl > div.flex (Header) > button.tab-btn
        const tabsHeader = tabBtn.parentElement;
        const tabsContainer = tabsHeader.parentElement;

        // 1. Update Buttons
        tabsHeader.querySelectorAll('.tab-btn').forEach(btn => {
            const isSelected = btn === tabBtn;
            if (isSelected) {
                // Active State
                btn.classList.add('text-gray-900', 'dark:text-gray-100', 'border-primary', 'font-bold');
                btn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent', 'font-medium');
            } else {
                // Inactive State
                btn.classList.remove('text-gray-900', 'dark:text-gray-100', 'border-primary', 'font-bold');
                btn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent', 'font-medium');
            }
        });

        // 2. Update Content
        const contentContainer = tabsContainer.querySelector('.p-6'); // The content wrapper
        if (contentContainer) {
            contentContainer.querySelectorAll('.tab-content').forEach(content => {
                if (content.id === targetId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        }
    });
});

// Copy URL Function
window.copyCurrentUrl = function () {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('复制成功！\n页面地址已复制到剪贴板。');
        }).catch(err => {
            console.error('Clipboard API failed', err);
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }

    function fallbackCopy(text) {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            const msg = successful ? '复制成功！' : '复制失败';
            alert(msg + (successful ? '\n页面地址已复制到剪贴板。' : ''));
        } catch (err) {
            prompt("无法自动复制，请手动复制以下链接：", text);
        }
        document.body.removeChild(textArea);
    }
};
