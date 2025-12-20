/**
 * Markdown Renderer Logic
 * Decoupled from script.js
 * Handles:
 * 1. Markdown shortcut triggers (input event)
 * 2. Paste handling (Markdown to HTML)
 */

function initMarkdownEditor(selector) {
    const editors = document.querySelectorAll(selector);
    if (!editors.length) return;

    editors.forEach(editor => {
        // Enhanced Paste Handler for Markdown
        editor.addEventListener('paste', (e) => {
            // We want to intercept paste to support Markdown rendering
            const text = (e.clipboardData || window.clipboardData).getData('text');
            
            // If we have marked.js available
            if (text && typeof marked !== 'undefined') {
                e.preventDefault();
                // Parse markdown to HTML
                // trim to avoid extra newlines if possible, but keep structure
                const html = marked.parse(text);
                
                // Insert HTML at cursor
                document.execCommand('insertHTML', false, html);
            }
        });

        editor.addEventListener('input', (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            
            // We only care if we are in a text node
            if (node.nodeType !== Node.TEXT_NODE) return;
    
            const text = node.textContent;
            // Cursor position in the text node
            const offset = range.startOffset;
            
            // Get text up to the cursor
            const textBefore = text.slice(0, offset);
    
            // 1. Block Triggers (Triggered by Space)
            if (/[\s\u00A0]$/.test(textBefore)) {
                const cleanText = textBefore.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
                // H1: "# "
                if (/^#[\s\u00A0]$/.test(cleanText)) {
                    transformBlock(editor, 'H1', textBefore.length); 
                    return;
                }
                // H2: "## "
                if (/^##[\s\u00A0]$/.test(cleanText)) {
                    transformBlock(editor, 'H2', textBefore.length); 
                    return;
                }
                // H3: "### "
                if (/^###[\s\u00A0]$/.test(cleanText)) {
                    transformBlock(editor, 'H3', textBefore.length); 
                    return;
                }
                // Unordered List: "* " or "- "
                if (/^[\*\-][\s\u00A0]$/.test(cleanText)) {
                    transformBlock(editor, 'insertUnorderedList', textBefore.length);
                    return;
                }
                // Ordered List: "1. "
                if (/^1\.[\s\u00A0]$/.test(cleanText)) {
                    transformBlock(editor, 'insertOrderedList', textBefore.length);
                    return;
                }
            }
    
            // 2. Inline Triggers (Bold/Italic)
            const boldMatch = textBefore.match(/\*\*([^*]+)\*\*$/);
            if (boldMatch) {
                const matchText = boldMatch[0]; 
                const contentText = boldMatch[1]; 
                transformInline(matchText.length, `<b>${contentText}</b>`);
                return;
            }
    
            const italicMatch = textBefore.match(/\*([^*]+)\*$/);
            if (italicMatch) {
                const matchIndex = italicMatch.index;
                if (matchIndex > 0 && textBefore[matchIndex - 1] === '*') {
                    return; 
                }
    
                const matchText = italicMatch[0]; 
                const contentText = italicMatch[1]; 
                transformInline(matchText.length, `<i>${contentText}</i>`);
                return;
            }
        });
    });
}

function transformBlock(editor, command, removeChars) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    // 1. Remove trigger characters
    range.setStart(node, 0);
    range.setEnd(node, removeChars);
    range.deleteContents();

    // 2. Custom handling for Headers (H1-H3) to avoid block merging issues
    // Manually create the element instead of using formatBlock, which prevents affecting previous siblings in the same container.
    if (['H1', 'H2', 'H3'].includes(command)) {
        const parent = node.parentNode;
        const newBlock = document.createElement(command);
        
        // Insert newBlock before the current node
        if (parent) {
            parent.insertBefore(newBlock, node);
        }

        // Move content or add placeholder
        if (node.textContent.length > 0) {
            // Move the remaining text (suffix) into the new block
            newBlock.appendChild(node);
        } else {
            // Empty line: add BR for height/focus and remove the empty text node
            newBlock.appendChild(document.createElement('br'));
            if (parent) parent.removeChild(node);
        }
        
        // Reset Cursor to inside the new block
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(true); // Collapse to start
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
    }

    // 3. Handling for Lists (UL/OL) - rely on execCommand
    // Fix for root text nodes: Wrap in DIV first to ensure execCommand works correctly
    if (node.parentNode === editor) {
        const wrapper = document.createElement('div');
        editor.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        
        // Restore selection to the text node inside the wrapper
        const newRange = document.createRange();
        newRange.selectNodeContents(node);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    // Now safe to use execCommand for lists
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        document.execCommand(command, false, null);
    } else {
        // Fallback (shouldn't be reached for H1-H3 anymore)
        try {
            document.execCommand('formatBlock', false, command);
        } catch (e) {
            document.execCommand('formatBlock', false, `<${command}>`);
        }
    }
}

function transformInline(length, html) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    range.setStart(node, offset - length);
    range.setEnd(node, offset);
    
    document.execCommand('insertHTML', false, html);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initMarkdownEditor('.ql-editor'));
} else {
    initMarkdownEditor('.ql-editor');
}
