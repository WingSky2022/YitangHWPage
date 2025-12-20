document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabs = document.querySelectorAll('.info-tab');
    const contentArea = document.getElementById('info-content');

    // Initialize styling for the default active tab
    const initialActiveTab = document.querySelector('.info-tab.active');
    if (initialActiveTab && contentArea) {
        const target = initialActiveTab.getAttribute('data-tab');
        contentArea.classList.add(`style-${target}`);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Toggle active state on tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle active state on content panes
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const pane = document.getElementById(`pane-${target}`);
            if (pane) pane.classList.add('active');

            // Update content area border/bg style
            if (contentArea) {
                // Remove all style-* classes
                contentArea.classList.forEach(cls => {
                    if (cls.startsWith('style-')) contentArea.classList.remove(cls);
                });
                contentArea.classList.add(`style-${target}`);
            }
        });
    });

    // 2. NPS Star Rating
    const stars = document.querySelectorAll('.star-rating .iconfont');
    const ratingLabel = document.querySelector('.rating-label');
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.getAttribute('data-val'));
            highlightStars(val);
        });
        
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-val'));
            highlightStars(val);
            if(ratingLabel) ratingLabel.textContent = `已打分：${val} 分`;
            // Save selection (mock)
            star.parentElement.setAttribute('data-selected', val);
        });
    });

    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        const parent = document.querySelector('.star-rating');
        const selected = parent.getAttribute('data-selected');
        if (selected) {
            highlightStars(parseInt(selected));
        } else {
            highlightStars(0);
        }
    });

    function highlightStars(count) {
        stars.forEach(s => {
            const v = parseInt(s.getAttribute('data-val'));
            if (v <= count) s.classList.add('active');
            else s.classList.remove('active');
        });
    }

    // 3. Simple Markdown Input (Enhanced with Notion-like behavior)
    const editor = document.querySelector('.ql-editor');
    if (editor) {
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
            // Only trigger if the last character typed was a space (implied by input event + text checking)
            // But 'input' fires after change. If textBefore ends with space, we might have a trigger.
            
            if (textBefore.endsWith(' ')) {
                // H1: "# "
                if (/^#\s$/.test(textBefore)) {
                    transformBlock('H1', 2); // Remove 2 chars "# "
                    return;
                }
                // H2: "## "
                if (/^##\s$/.test(textBefore)) {
                    transformBlock('H2', 3); // Remove 3 chars "## "
                    return;
                }
                // H3: "### "
                if (/^###\s$/.test(textBefore)) {
                    transformBlock('H3', 4); // Remove 4 chars "### "
                    return;
                }
                // Unordered List: "* " or "- "
                if (/^[\*\-]\s$/.test(textBefore)) {
                    transformBlock('insertUnorderedList', 2);
                    return;
                }
                // Ordered List: "1. "
                if (/^1\.\s$/.test(textBefore)) {
                    transformBlock('insertOrderedList', 3);
                    return;
                }
            }

            // 2. Inline Triggers (Bold/Italic)
            // Bold: "**text**" -> triggers when last char is '*'
            // We need to check if we just completed a **...** pattern.
            // Note: input event fires after char insertion.
            
            // Bold
            const boldMatch = textBefore.match(/\*\*([^*]+)\*\*$/);
            if (boldMatch) {
                const matchText = boldMatch[0]; // "**text**"
                const contentText = boldMatch[1]; // "text"
                transformInline(matchText.length, `<b>${contentText}</b>`);
                return;
            }

            // Italic: "*text*"
            // Need to be careful not to trigger on first '*' of '**'
            // Simple heuristic: if it matches *text* and NOT ending in **, and previous char wasn't *
            const italicMatch = textBefore.match(/(?<!\*)\*([^*]+)\*$/);
            if (italicMatch) {
                const matchText = italicMatch[0]; // "*text*"
                const contentText = italicMatch[1]; // "text"
                transformInline(matchText.length, `<i>${contentText}</i>`);
                return;
            }
        });

        function transformBlock(command, removeChars) {
            // Remove the trigger characters (e.g., "# ")
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            
            // Adjust range to select the trigger characters
            range.setStart(node, 0);
            range.setEnd(node, removeChars);
            range.deleteContents();

            // Execute the command
            if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
                document.execCommand(command, false, null);
            } else {
                document.execCommand('formatBlock', false, command);
            }
        }

        function transformInline(length, html) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            const offset = range.startOffset;

            // Select the markdown pattern (e.g., "**text**")
            range.setStart(node, offset - length);
            range.setEnd(node, offset);
            
            // Replace with HTML
            // execCommand 'insertHTML' is safest for preserving undo stack and cursor
            document.execCommand('insertHTML', false, html);
            
            // In some browsers, we might need to manually ensure cursor is after the inserted element
            // But insertHTML usually handles it well.
        }
    }

    // 4. Reveal App
    setTimeout(() => {
        const app = document.getElementById('app');
        if (app) app.classList.add('loaded');
    }, 100);
});