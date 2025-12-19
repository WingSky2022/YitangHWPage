
/**
 * 作业系统界面优化逻辑 (Precise Ref Edition)
 * 职责：实现与图片高度一致的 UI，并整合 Markdown 输入增强
 */

const generateStyles = () => `
:root {
  --primary-color: #fad200;
  --primary-blue: #4a90e2;
  --bg-main: #f7f7f8;
  --bg-card: #ffffff;
  --text-main: #1a1a1a;
  --text-secondary: #717182;
  --border-color: #e9ebef;
  --highlight-bg: rgba(250, 210, 0, 0.2);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.03);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --radius-lg: 16px;
  --radius-md: 12px;
}

[data-theme="dark"] {
  --bg-main: #111111;
  --bg-card: #1e1e1e;
  --text-main: #e0e0e0;
  --text-secondary: #9a9a9a;
  --border-color: #2e2e2e;
  --highlight-bg: rgba(74, 144, 226, 0.3);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.5);
}

body {
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin: 0; padding: 0;
  line-height: 1.6;
  transition: var(--transition);
}

.max-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 140px;
}

/* Header */
.assignment-header { margin-bottom: 32px; }
.tag-label { 
  display: inline-block; 
  background: var(--primary-color); 
  color: #000; 
  padding: 6px 14px; 
  border-radius: 8px; 
  font-size: 14px; 
  font-weight: 600; 
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(250, 210, 0, 0.2);
}
.page-title { font-size: 24px; font-weight: 700; margin: 0; color: var(--text-main); }

/* Info Cards Sidebar (参考图片1) */
.info-cards-section { margin-bottom: 32px; }
.info-cards-container { display: flex; gap: 20px; align-items: flex-start; }
.info-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }

.info-tab {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f1f1f3;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}
[data-theme="dark"] .info-tab { background: #2a2a2a; }

.info-tab.active {
  background: var(--bg-card);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.tab-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.tab-icon i { font-size: 22px; }
.rules-bg { background: #3b82f6; }
.history-bg { background: #a855f7; }
.notice-bg { background: #10b981; }

.tab-title { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
.tab-subtitle { font-size: 12px; color: var(--text-secondary); }

.info-content-area {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 3px solid var(--primary-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  min-height: 160px;
}
.tab-pane { display: none; font-size: 15px; color: var(--text-main); }
.tab-pane.active { display: block; animation: slideIn 0.3s ease-out; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Question Area */
.question-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.q-num {
  width: 32px; height: 32px;
  background: rgba(250, 210, 0, 0.15);
  color: #000;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; font-weight: 800;
  [data-theme="dark"] & { color: #fff; }
}
.q-title { font-size: 18px; font-weight: 700; }
.q-desc { font-size: 14px; color: var(--text-secondary); margin: 16px 0 24px; }

.editor-wrapper { border-radius: 12px; border: 1px solid var(--border-color); background: #fafafb; overflow: hidden; }
[data-theme="dark"] .editor-wrapper { background: #1a1a1a; }
.ql-toolbar { padding: 10px; background: #f1f1f3; border-bottom: 1px solid var(--border-color); display: flex; gap: 8px; }
[data-theme="dark"] .ql-toolbar { background: #2a2a2a; }
.ql-editor { min-height: 240px; padding: 20px; outline: none; font-size: 16px; }

/* Feedback */
.feedback-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border-color);
}
.header-pill { 
  background: var(--primary-color); 
  color: #000; 
  padding: 8px 24px; 
  border-radius: 10px; 
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(250, 210, 0, 0.3);
}
.star-rating { display: flex; justify-content: center; gap: 10px; margin: 24px 0 12px; }
.star-rating i { font-size: 34px; color: #e5e7eb; cursor: pointer; transition: transform 0.1s; }
.star-rating i.active { color: var(--primary-color); }
.rating-label { text-align: center; color: var(--text-secondary); font-size: 13px; }

/* Footer (参考图片3) */
.action-footer {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 16px 0 32px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}
.footer-content {
  max-width: 960px; margin: 0 auto; padding: 0 24px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.auto-save-hint { font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

.footer-btns { display: flex; gap: 16px; width: 100%; justify-content: center; }
.btn-pills {
  border: none;
  border-radius: 9999px;
  padding: 14px 44px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  transition: var(--transition);
}
.btn-storage {
  background: #fff9db; color: #856404;
  [data-theme="dark"] & { background: #332b00; color: #fad200; }
}
.btn-submit {
  background: var(--primary-color); color: #000;
  box-shadow: 0 4px 14px rgba(250, 210, 0, 0.4);
}
.btn-pills:hover { transform: translateY(-2px); opacity: 0.9; }

/* Theme Toggle Custom Icons */
.theme-toggle {
  position: fixed; top: 24px; right: 24px;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--bg-card); border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: var(--shadow-md); z-index: 10001;
  transition: var(--transition);
}
.theme-toggle:hover { transform: scale(1.1); }
.theme-toggle svg { width: 22px; height: 22px; stroke: var(--text-main); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* Markdown Styles */
blockquote { border-left: 4px solid var(--primary-blue); padding-left: 16px; color: var(--text-secondary); margin: 16px 0; }
mark { background: var(--highlight-bg); color: inherit; border-radius: 2px; padding: 0 2px; }
`;

class UIController {
  constructor() {
    this.initTabs();
    this.initStars();
    this.initSlider();
    this.initTheme();
    document.getElementById('app')?.classList.add('loaded');
  }

  initTabs() {
    const tabs = document.querySelectorAll('.info-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(`pane-${target}`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  initStars() {
    const stars = document.querySelectorAll('#nps-stars i');
    const label = document.querySelector('.rating-label');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const valStr = star.getAttribute('data-val');
        if (!valStr) return;
        const val = parseInt(valStr);
        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add('active');
          else s.classList.remove('active');
        });
        if (label) label.textContent = `${val}/10分`;
      });
    });
  }

  initSlider() {
    const track = document.querySelector('.slider-track');
    const thumb = document.querySelector('.slider-thumb') as HTMLElement | null;
    const options = document.querySelectorAll('.slider-option');
    options.forEach((opt, idx) => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (thumb) {
          thumb.style.transform = `translateX(${idx * 100}%)`;
        }
      });
    });
  }

  initTheme() {
    let theme = localStorage.getItem('theme') || 'light';
    const apply = (t: string) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
      this.updateThemeIcon(t);
    };

    const btn = document.createElement('div');
    btn.className = 'theme-toggle';
    btn.onclick = () => {
      theme = theme === 'light' ? 'dark' : 'light';
      apply(theme);
    };
    document.body.appendChild(btn);
    apply(theme);
  }

  updateThemeIcon(t: string) {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    // 使用 SVG 替代字符图标
    const sunIcon = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.innerHTML = t === 'light' ? moonIcon : sunIcon;
  }
}

/**
 * 核心 Markdown 逻辑 (保持原有功能)
 */
const handleEditorKeydown = (e: KeyboardEvent) => {
  const selection = window.getSelection();
  if (!selection || !selection.focusNode) return;

  const node = selection.focusNode;
  const caretPos = selection.focusOffset;
  const content = node.textContent || '';
  const textBeforeCaret = content.substring(0, caretPos);

  let block = node.nodeType === 3 ? node.parentElement : node as HTMLElement;
  while (block && !['P', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'DIV', 'LI'].includes(block.nodeName)) {
    block = block.parentElement as HTMLElement;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    return;
  }

  if (e.key === ' ' || e.key === 'Enter') {
    const applyBlockFormat = (symbol: string, command: string, value?: string) => {
      if (textBeforeCaret !== symbol) return false;
      e.preventDefault();
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, caretPos);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('delete');
      if (command === 'formatBlock') {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command);
      }
      return true;
    };

    if (textBeforeCaret === '---') {
      applyBlockFormat('---', 'insertHorizontalRule');
      return;
    }

    if (e.key === ' ') {
      if (applyBlockFormat('#', 'formatBlock', 'H1')) return;
      if (applyBlockFormat('##', 'formatBlock', 'H2')) return;
      if (applyBlockFormat('*', 'insertUnorderedList')) return;
      if (applyBlockFormat('1.', 'insertOrderedList')) return;
      if (applyBlockFormat('>', 'formatBlock', 'BLOCKQUOTE')) return;
    }
  }

  if (e.key === '*' || e.key === '=') {
    const inlineRules = [
      { trigger: '*', regex: /\*\*([^*]+)\*$/, tag: 'strong' }, 
      { trigger: '*', regex: /(?<!\*)\*([^*]+)$/, tag: 'em' },
      { trigger: '=', regex: /==([^=]+)=$/, tag: 'mark' }
    ];

    for (const rule of inlineRules) {
      if (e.key !== rule.trigger) continue;
      const match = textBeforeCaret.match(rule.regex);
      if (match) {
        e.preventDefault();
        const fullMatch = match[0];
        const innerText = match[1];
        const range = document.createRange();
        range.setStart(node, caretPos - fullMatch.length);
        range.setEnd(node, caretPos);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('delete');
        const htmlToInsert = `<${rule.tag}>${innerText}</${rule.tag}>&#8203;`;
        document.execCommand('insertHTML', false, htmlToInsert);
        return;
      }
    }
  }
};

const handlePasteMarkdown = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text/plain');
  if (!text) return;
  const isMarkdown = /(#+ |\[.*\]\(.*\)|(\*\*|__)(.*)(\*\*|__)|> |`{3}|==.*==)/.test(text);
  if (isMarkdown && (window as any).marked) {
    event.preventDefault();
    const html = (window as any).marked.parse(text);
    document.execCommand('insertHTML', false, html);
  }
};

const enhanceEditor = (editor: HTMLElement) => {
  if (editor.hasAttribute('data-enhanced')) return;
  editor.setAttribute('data-enhanced', 'true');
  editor.addEventListener('paste', handlePasteMarkdown as any);
  editor.addEventListener('keydown', handleEditorKeydown as any);
};

const init = () => {
  const styleTag = document.createElement('style');
  styleTag.textContent = generateStyles();
  document.head.appendChild(styleTag);

  new UIController();

  const scan = () => document.querySelectorAll('.ql-editor').forEach(el => enhanceEditor(el as HTMLElement));
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
};

init();
