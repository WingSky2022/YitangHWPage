
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
    const thumb = document.querySelector('.slider-thumb');
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
    const apply = (t) => {
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

  updateThemeIcon(t) {
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
const handleEditorKeydown = (e) => {
  const selection = window.getSelection();
  if (!selection || !selection.focusNode) return;

  const node = selection.focusNode;
  const caretPos = selection.focusOffset;
  const content = node.textContent || '';
  const textBeforeCaret = content.substring(0, caretPos);

  let block = node.nodeType === 3 ? node.parentElement : node;
  while (block && !['P', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'DIV', 'LI'].includes(block.nodeName)) {
    block = block.parentElement;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    return;
  }

  if (e.key === ' ' || e.key === 'Enter') {
    const applyBlockFormat = (symbol, command, value) => {
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

const handlePasteMarkdown = (event) => {
  const text = event.clipboardData?.getData('text/plain');
  if (!text) return;
  const isMarkdown = /(#+ |\[.*\]\(.*\)|(\*\*|__)(.*)(\*\*|__)|> |`{3}|==.*==)/.test(text);
  if (isMarkdown && window.marked) {
    event.preventDefault();
    const html = window.marked.parse(text);
    document.execCommand('insertHTML', false, html);
  }
};

const enhanceEditor = (editor) => {
  if (editor.hasAttribute('data-enhanced')) return;
  editor.setAttribute('data-enhanced', 'true');
  editor.addEventListener('paste', handlePasteMarkdown);
  editor.addEventListener('keydown', handleEditorKeydown);
};

const init = () => {
  // CSS is now loaded via <link> in HTML
  new UIController();

  const scan = () => document.querySelectorAll('.ql-editor').forEach(el => enhanceEditor(el));
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
};

init();
