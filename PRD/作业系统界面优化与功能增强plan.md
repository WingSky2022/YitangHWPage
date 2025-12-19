---
name: 作业系统界面优化与功能增强
overview: 优化作业系统界面（Notion风格）、为 Quill 编辑器添加 Markdown 支持、实现深色模式（蓝色调主题）
todos:
  - id: ui-layout-refactor
    content: 重构整体布局，采用 Notion 风格：增加最大宽度、卡片式设计、优化间距系统
    status: completed
  - id: ui-component-styles
    content: 优化组件样式：作业规则卡片、题目区域、输入框、按钮等
    status: completed
    dependencies:
      - ui-layout-refactor
  - id: markdown-integration
    content: 集成 Markdown 支持：添加 quill-markdown 或自定义解析器，实现 Markdown 到 Quill Delta 的转换
    status: completed
  - id: markdown-paste-handler
    content: 实现 Markdown 粘贴处理：监听粘贴事件，自动识别并转换 Markdown 文本
    status: completed
    dependencies:
      - markdown-integration
  - id: dark-mode-css-variables
    content: 创建 CSS 变量系统：定义亮色和深色模式的颜色变量
    status: completed
  - id: dark-mode-toggle
    content: 实现主题切换功能：添加切换按钮、localStorage 保存、系统主题检测
    status: completed
    dependencies:
      - dark-mode-css-variables
  - id: dark-mode-styles
    content: 完善深色模式样式：背景色层级、文字颜色、主色调应用、编辑器适配
    status: completed
    dependencies:
      - dark-mode-css-variables
  - id: responsive-optimization
    content: 响应式优化：确保在不同屏幕尺寸下的良好显示效果
    status: completed
    dependencies:
      - ui-layout-refactor
  - id: testing-optimization
    content: 测试与优化：跨浏览器测试、功能测试、用户体验优化
    status: completed
    dependencies:
      - ui-component-styles
      - markdown-paste-handler
      - dark-mode-styles
      - responsive-optimization
---

# 作业系统界面优化与

功能增强计划

## 一、界面优化（Notion 风格）

### 1.1 整体布局重构

- **文件**: `一堂作业优化/未填写的作业.html`, `一堂作业优化/完成版作业.html`
- **优化内容**:
- 增加页面最大宽度限制（如 960px），居中显示，提升大屏阅读体验
- 调整卡片式布局，增加圆角和阴影效果
- 优化间距系统：题目间距、输入框内边距、整体留白
- 优化字体层级：标题、正文、提示文字的大小和字重
- 添加微妙的背景色区分（浅灰色背景 vs 白色卡片）

### 1.2 组件样式优化

- **作业规则区域**：改为卡片式，增加图标和更好的视觉层级
- **题目区域**：优化标题样式，增加序号视觉设计
- **输入框区域**：优化 Quill 编辑器工具栏样式，使其更现代化
- **按钮样式**：优化暂存/提交按钮，采用更现代的样式

### 1.3 响应式优化

- 优化移动端显示效果
- 确保在不同屏幕尺寸下都有良好的体验

## 二、Markdown 输入支持（增强 Quill）

### 2.1 集成 Markdown 插件

- **添加依赖**:
- `quill-markdown` 或自定义 Markdown 解析器
- `marked` 或 `markdown-it` 用于 Markdown 解析
- **实现功能**:
- 监听键盘输入，识别 Markdown 语法
- 实时将 Markdown 转换为 Quill Delta 格式
- 支持粘贴 Markdown 文本时自动转换

### 2.2 Markdown 语法支持

支持以下 Markdown 语法：

- 标题（# H1, ## H2）
- 粗体（**text**）、斜体（*text*）
- 列表（有序、无序）
- 链接、图片
- 代码块（```code```）

### 2.3 用户交互优化

- 添加 Markdown 提示：在编辑器底部显示支持的 Markdown 语法
- 支持快捷键（如 Ctrl+B 加粗）

## 三、深色模式实现

### 3.1 CSS 变量系统

- **创建颜色变量系统**:
  ```css
        :root {
          --primary-color: #fad200;
          --bg-color: #ffffff;
          --text-color: #111111;
          /* ... */
        }
        
        [data-theme="dark"] {
          --primary-color: #4a90e2;
          --bg-color: #1a1a1a;
          --text-color: #e0e0e0;
          /* ... */
        }
  ```




### 3.2 主题切换功能

- 添加主题切换按钮（右上角或顶部导航栏）
- 使用 localStorage 保存用户主题偏好
- 支持系统主题检测（prefers-color-scheme）

### 3.3 深色模式样式调整

- **背景色层级**:
- 主背景：`#1a1a1a`
- 卡片背景：`#242424`
- 输入框背景：`#2a2a2a`
- **文字颜色**:
- 主文字：`#e0e0e0`
- 次要文字：`#b0b0b0`
- 占位符：`#808080`
- **主色调应用**:
- 强调色：`#4a90e2`（蓝色）
- 按钮、链接等交互元素使用蓝色调
- **编辑器样式**:
- Quill 工具栏和编辑器在深色模式下的适配
- 保持编辑器的可用性和可读性

## 四、技术实现细节

### 4.1 文件结构

由于是单 HTML 文件，需要：

- 在 `<style>` 标签中添加所有新样式
- 在 `<script>` 标签中添加 JavaScript 逻辑
- 保持现有 Vue.js 代码的兼容性

### 4.2 兼容性考虑

- 确保不影响现有功能
- 保持与后端数据格式的兼容
- 渐进式增强，不影响旧版本浏览器

### 4.3 性能优化

- CSS 变量使用（避免重复代码）
- Markdown 解析使用防抖处理
- 主题切换使用 CSS 过渡动画

## 五、实施步骤

1. **第一阶段：界面优化**

- 重构 CSS，采用 Notion 风格
- 优化布局和间距
- 调整组件样式

2. **第二阶段：Markdown 支持**

- 集成 Markdown 解析库
- 实现实时转换功能
- 测试各种 Markdown 语法

3. **第三阶段：深色模式**

- 创建 CSS 变量系统
- 实现主题切换逻辑
- 完善深色模式样式

4. **第四阶段：测试与优化**