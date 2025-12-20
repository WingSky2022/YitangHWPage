# Markdown 格式渲染功能说明

本项目在富文本编辑器中集成了轻量级的 Markdown 实时渲染功能，支持常用的块级和行内语法，并优化了粘贴体验。

## 1. 实时渲染触发 (Shortcut Triggers)

在编辑器中输入特定 Markdown 语法并按下 **空格键** (Space) 时，会自动转换为对应的富文本格式。

### 块级格式 (Block Formats)
| 语法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `# ` | 一级标题 (H1) | 输入 `#` 后按空格 |
| `## ` | 二级标题 (H2) | 输入 `##` 后按空格 |
| `### ` | 三级标题 (H3) | 输入 `###` 后按空格 |
| `* ` 或 `- ` | 无序列表 (Unordered List) | 输入 `*` 或 `-` 后按空格 |
| `1. ` | 有序列表 (Ordered List) | 输入 `1.` 后按空格 |

### 行内格式 (Inline Formats)
| 语法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `**text**` | 粗体 (Bold) | 输入 `**加粗内容**` (无需空格，输入完自动转换) |
| `*text*` | 斜体 (Italic) | 输入 `*斜体内容*` (无需空格，输入完自动转换) |

## 2. 粘贴支持 (Paste Support)

支持从外部应用（如 **飞书**、**Notion**、**VS Code** 等）复制 Markdown 格式文本并粘贴到编辑器中。

*   **功能描述**：系统会自动检测粘贴板中的纯文本内容，如果包含 Markdown 语法，将利用 `marked.js` 解析引擎将其转换为 HTML 格式并插入编辑器。
*   **适用场景**：
    *   从笔记软件复制带有标题、列表、粗体等的文档。
    *   粘贴大段 Markdown 源码。

## 3. 核心逻辑解耦 (Architecture)

Markdown 渲染逻辑已从主脚本 `script.js` 中解耦，独立为 `markdown-renderer.js` 文件。

*   **文件路径**: `Projects/一堂作业优化/markdown-renderer.js`
*   **主要模块**:
    *   `initMarkdownEditor(selector)`: 初始化监听器。
    *   `transformBlock(...)`: 处理块级转换，包含针对首行/孤立文本节点的 DOM 结构修复逻辑（自动包裹 `<div>`），解决了回车后重新渲染上一行的 Bug。
    *   `transformInline(...)`: 处理行内样式转换。
    *   **Paste Listener**: 拦截粘贴事件，调用 `marked.parse` 进行转换。
