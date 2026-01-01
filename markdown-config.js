/**
 * Markdown 渲染器配置
 * 定义正则模式及其对应的命令或标签。
 */
const MarkdownConfig = {
    // 视觉样式配置 (应用于 .ql-editor 等容器)
    visualStyles: {
        lineHeight: '1.6',
        headingLineHeight: '1.4',
        paragraphMargin: '0.8em',
        listItemMargin: '0.2em',
        blockquoteMargin: '0.8em',
        h1MarginTop: '8px',
        h2MarginTop: '8px',
        h3MarginTop: '8px'
    },

    // 块级触发器 (通过空格键触发)
    blockPatterns: [
        {
            name: 'H1',
            regex: /^#[\s\u00A0]$/,
            command: 'H1'
        },
        {
            name: 'H2',
            regex: /^##[\s\u00A0]$/,
            command: 'H2'
        },
        {
            name: 'H3',
            regex: /^###[\s\u00A0]$/,
            command: 'H3'
        },
        {
            name: 'Unordered List',
            regex: /^[\*\-][\s\u00A0]$/,
            command: 'insertUnorderedList'
        },
        {
            name: 'Ordered List',
            regex: /^1\.[\s\u00A0]$/,
            command: 'insertOrderedList'
        },
        {
            name: 'Blockquote',
            regex: /^>[\s\u00A0]$/,
            command: 'blockquote'
        }
    ],

    // 行内触发器 (匹配到模式时立即触发)
    inlinePatterns: [
        {
            name: 'Bold',
            regex: /\*\*([^*]+)\*\*$/,
            tag: 'b'
        },
        {
            name: 'Italic',
            regex: /\*([^*]+)\*$/,
            check: (text, matchIndex) => {
                // 确保不是粗体的一部分 (例如 ***)
                return !(matchIndex > 0 && text[matchIndex - 1] === '*');
            },
            tag: 'i'
        }
    ]
};
