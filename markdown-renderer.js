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
        // Prevent default list merging behavior on Backspace & Handle Enter in Blockquote
        editor.addEventListener('keydown', (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            let node = range.startContainer;

            // BACKSPACE Logic
            if (e.key === 'Backspace') {
                if (!selection.isCollapsed) return;

                // Find if we are inside an LI or BLOCKQUOTE
                let block = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
                while (block && block !== editor && !['LI', 'BLOCKQUOTE'].includes(block.tagName)) {
                    block = block.parentNode;
                }

                // If inside a list item or blockquote
                if (block && (block.tagName === 'LI' || block.tagName === 'BLOCKQUOTE')) {
                    // Check if cursor is at the start of the block
                    const preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(block);
                    preCaretRange.setEnd(range.startContainer, range.startOffset);

                    // If we are at the very beginning of the block
                    if (preCaretRange.toString().length === 0) {
                        e.preventDefault();
                        // "Outdent" works for Lists and Blockquotes (converts to paragraph)
                        document.execCommand('outdent');
                    }
                }
            }
            // ENTER Logic
            else if (e.key === 'Enter') {
                // Determine block context
                let block = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
                while (block && block !== editor && block.tagName !== 'BLOCKQUOTE') {
                    block = block.parentNode;
                }

                if (block && block.tagName === 'BLOCKQUOTE') {
                    // Check if the current line is "empty" (or contains only break)
                    // Note: blockquote might contain multiple lines if using P or BR. 
                    // Usually <blockquote ...>Text</blockquote>.
                    // If user hits Enter -> browser inserts <div> or <p> or <br> inside blockquote.

                    // Simple check: Is the TEXT content of the blockquote empty?
                    // Or is the current "line" empty?
                    // If `markdown-renderer` enforces P tags or similar, we check that.
                    // If checking pure text content of the *current line*:
                    // Let's rely on text content of the node being empty or just newline.

                    const lineContent = block.textContent;
                    if (!lineContent.trim()) {
                        // If completely empty blockquote, Break out
                        e.preventDefault();
                        document.execCommand('formatBlock', false, 'P');
                        return;
                    }

                    // If we are on a new empty line INSIDE blockquote?
                    // This is harder to detect reliably across browsers without P tags.
                    // But user request: "Blockquote empty line Enter -> Normal line".
                    // Typical behavior: Press Enter to create new line. If that new line is empty and we press Enter again?
                    // Or if we are on an empty line.

                    // Let's check if the specific node is empty.
                    if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'P' || node.tagName === 'DIV') && !node.textContent.trim()) {
                        e.preventDefault();
                        document.execCommand('outdent'); // Or formatBlock P
                        return;
                    }
                    // If text node is empty/BR?
                    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                        // Check if it's the ONLY thing? 
                        // Let's try aggressive approach: If line seems empty, break out. [RISKY]

                        // Safer approach: If user hits Enter TWICE? 
                        // User request: "Empty line Enter -> Normal line".
                        // This implies we already ARE on an empty line.

                        // Check if current block/line is empty
                        // Using selection to see if we are in an empty context
                        const text = node.textContent; // or block.innerText

                        // If the ENTIRE blockquote is just a ZWS or empty, format to P
                        if (!block.innerText.trim()) {
                            e.preventDefault();
                            document.execCommand('formatBlock', false, 'P');
                        }
                    }
                }
            }
        });

        // Enhanced Paste Handler for Markdown
        editor.addEventListener('paste', (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (text && typeof marked !== 'undefined') {
                e.preventDefault();
                const html = marked.parse(text);
                document.execCommand('insertHTML', false, html);
            }
        });

        editor.addEventListener('input', (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType !== Node.TEXT_NODE) return;

            const text = node.textContent;
            const offset = range.startOffset;
            const textBefore = text.slice(0, offset);

            // 检测结尾是否为空格或非中断空格 (Space key trigger)
            if (/[\s\u00A0]$/.test(textBefore)) {
                const cleanText = textBefore.replace(/[\u200B-\u200D\uFEFF]/g, '');

                // 使用 MarkdownConfig 中的块级模式
                for (const pattern of MarkdownConfig.blockPatterns) {
                    if (pattern.regex.test(cleanText)) {
                        transformBlock(editor, pattern.command, textBefore.length);
                        return;
                    }
                }
            }

            // 使用 MarkdownConfig 中的行内模式 (立即触发，无需空格)
            for (const pattern of MarkdownConfig.inlinePatterns) {
                const match = textBefore.match(pattern.regex);
                if (match) {
                    // 执行额外的逻辑检查 (如果有)
                    if (pattern.check && !pattern.check(textBefore, match.index)) continue;

                    const matchText = match[0];
                    const contentText = match[1];
                    transformInline(matchText.length, `<${pattern.tag}>${contentText}</${pattern.tag}>`);
                    return;
                }
            }
        });
    });
}

function transformBlock(editor, command, removeChars) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    // 1. Remove trigger characters
    range.setStart(node, 0);
    range.setEnd(node, removeChars);
    range.deleteContents();

    const parent = node.parentNode;

    // 2. Block Isolation Logic (FIXED)
    // Ensures current line is in its own block if it shares a container or is at root
    let blockToReplace = parent;
    const needsIsolation = (parent === editor) || (parent.childNodes.length > 1);

    if (needsIsolation) {
        const wrapper = document.createElement('div');
        if (parent === editor) {
            editor.insertBefore(wrapper, node);
        } else {
            // Remove preceding BR if splitting
            const prev = node.previousSibling;
            if (prev && prev.nodeName === 'BR') parent.removeChild(prev);

            // Insert wrapper
            if (parent.nextSibling) {
                editor.insertBefore(wrapper, parent.nextSibling);
            } else {
                editor.appendChild(wrapper);
            }
        }
        wrapper.appendChild(node);

        // Restore selection
        const newRange = document.createRange();
        newRange.selectNodeContents(node);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        blockToReplace = wrapper;
    }

    // 3. Handle Lists Manually
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        const tag = command === 'insertUnorderedList' ? 'ul' : 'ol';
        const list = document.createElement(tag);
        const li = document.createElement('li');
        list.appendChild(li);

        if (node.textContent.length === 0) {
            li.appendChild(document.createElement('br'));
        } else {
            li.appendChild(node);
        }

        blockToReplace.parentNode.replaceChild(list, blockToReplace);

        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
    }

    // 4. Handle Headers Manually
    if (['H1', 'H2', 'H3'].includes(command)) {
        const newHeader = document.createElement(command);
        blockToReplace.parentNode.replaceChild(newHeader, blockToReplace);

        if (node.textContent.length > 0) {
            newHeader.appendChild(node);
        } else {
            newHeader.appendChild(document.createElement('br'));
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(newHeader);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
    }

    // Fallback
    try {
        document.execCommand('formatBlock', false, command);
    } catch (e) {
        document.execCommand('formatBlock', false, `<${command}>`);
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

function applyVisualStyles() {
    if (!MarkdownConfig.visualStyles) return;

    const styleId = 'markdown-dynamic-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    const { lineHeight, headingLineHeight, paragraphMargin, listItemMargin, blockquoteMargin, h1MarginTop, h2MarginTop, h3MarginTop } = MarkdownConfig.visualStyles;

    styleEl.innerHTML = `
        /* 动态注入的 Markdown 视觉样式 */
        .ql-editor, .fs-typography {
            line-height: ${lineHeight} !important;
        }
        .ql-editor p, .ql-editor div, .fs-body p {
            margin-bottom: ${paragraphMargin} !important;
        }
        .ql-editor li, .fs-body li {
            margin-bottom: ${listItemMargin} !important;
            line-height: ${lineHeight} !important;
        }
        .ql-editor blockquote {
            margin-bottom: ${blockquoteMargin} !important;
        }
        .ql-editor h1, .fs-h1, .ql-editor h2, .fs-h2, .ql-editor h3, .fs-h3 {
            line-height: ${headingLineHeight} !important;
        }
        .ql-editor h1, .fs-h1 {
            margin-top: ${h1MarginTop} !important;
        }
        .ql-editor h2, .fs-h2 {
            margin-top: ${h2MarginTop} !important;
        }
        .ql-editor h3, .fs-h3 {
            margin-top: ${h3MarginTop} !important;
        }
        /* Merge Adjacent Blockquotes */
        .ql-editor blockquote + blockquote {
            margin-top: -${blockquoteMargin} !important;
            padding-top: 0 !important;
            border-top: none !important; 
        }
    `;
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyVisualStyles();
        initMarkdownEditor('.ql-editor');
    });
} else {
    applyVisualStyles();
    initMarkdownEditor('.ql-editor');
}
