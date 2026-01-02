# 一堂作业系统前后端接口说明文档

本文档整理了 `index.html`（作业编辑页）与 `homework_done.html`（作业完成页）所需的后端接口及部署对接说明。

## 一、 接口列表 (API List)

### 1. 通用接口

| 接口名称         | 方法   | URL (示例)          | 说明                                                 |
| :--------------- | :----- | :------------------ | :--------------------------------------------------- |
| **获取用户信息** | `GET`  | `/api/user/current` | 用于显示顶部导航栏的用户头像信息（如 "Me" 占位符）。 |
| **图片上传**     | `POST` | `/api/upload/image` | 用于编辑器中插入图片。返回图片URL。                  |

### 2. 作业编辑页 (`index.html`)

页面加载时需通过 URL 参数或路径获取 `homeworkId`。

| 接口名称         | 方法   | URL (示例)                   | 说明                                                             |
| :--------------- | :----- | :--------------------------- | :--------------------------------------------------------------- |
| **获取作业详情** | `GET`  | `/api/homework/{id}`         | 获取作业题目配置、当前状态、标题、课程信息以及是否存在暂存草稿。 |
| **获取历史作业** | `GET`  | `/api/homework/{id}/history` | 获取该作业的历史提交记录（用于"历史作业"标签页）。               |
| **保存草稿**     | `POST` | `/api/homework/{id}/save`    | 点击顶部"保存"按钮或自动保存时调用。提交当前编辑内容。           |
| **提交作业**     | `POST` | `/api/homework/{id}/submit`  | 点击底部"提交"按钮时调用。提交完整作业内容、评分及公开意愿。     |

### 3. 作业完成页 (`homework_done.html`)

页面加载时需通过 URL 参数或路径获取 `homeworkId` 或 `submissionId`。

| 接口名称         | 方法  | URL (示例)                  | 说明                                                       |
| :--------------- | :---- | :-------------------------- | :--------------------------------------------------------- |
| **获取作业结果** | `GET` | `/api/homework/{id}/result` | 获取评分、提交时间、用户提交的内容（快照）以及班主任点评。 |

---

## 二、 详细数据结构 (Data Models)

### 2.1 获取作业详情 (`GET /api/homework/{id}`)
**Response Data:**
```json
{
  "id": "1451337",
  "title": "《业务公式实操1：建立公式篇》",
  "questions": [
    {
      "id": "q1",
      "title": "1、第一个作业：请根据自己的业务，写出三个公式。",
      "description": "...", 
      "placeholder": "在此输入您的学习心得..."
    },
    {
      "id": "q2",
      "title": "2、第二个作业：案例推演题", 
      "description": "...",
      "placeholder": "请输入文本内容..."
    }
  ],
  "draft": {
    "q1": "<html_content>",
    "q2": "<html_content>",
    "updatedAt": "2026-01-02 19:38"
  }
}
```

### 2.2 提交作业 (`POST /api/homework/{id}/submit`)
**Request Payload:**
```json
{
  "answers": {
    "q1": "<html_content>",
    "q2": "<html_content>"
  },
  "courseRating": 5,
  "publicWillingness": "yes" // yes, confirm, no
}
```

### 2.3 获取作业结果 (`GET /api/homework/{id}/result`)
**Response Data:**
```json
{
  "title": "《业务公式实操1：建立公式篇》",
  "submissionTime": "2026-01-02 12:00",
  "score": 6,
  "isExcellent": true, // 是否显示"优秀作业"印章
  "teacherComment": "总结得非常到位！...",
  "submittedContent": {
    "q1": "...",
    "q2": "..."
  },
  "satisfaction": {
    "score": 5,
    "publicWillingness": "愿意"
  }
}
```

---

## 三、 部署对接说明 (Deployment Guide)

部署 `index.html` 与 `homework_done.html` 时，请遵循以下步骤进行接口对接：

### 1. 环境变量配置
在前端项目配置中（如 `.env` 或 `config.js`），定义 API 基础路径：
```javascript
const API_BASE_URL = "https://api.yitang.top"; // 需替换为实际后端地址
```

### 2. 页面初始化参数注入
页面需要知道当前操作的是哪个作业。建议通过 URL 路径参数传递 ID。

*   **index.html**: 部署路由应匹配 `/homework/:id/edit`。
    *   JS 逻辑需解析 URL 中的 `:id`，并调用 `GET /api/homework/:id` 初始化编辑器内容。
*   **homework_done.html**: 部署路由应匹配 `/homework/:id` 或 `/homework/:id/result`。
    *   JS 逻辑需解析 URL 中的 `:id`，并调用 `GET /api/homework/:id/result` 渲染页面。

### 3. CSS 与 静态资源
*   确保 `index.css` 已正确部署并被两个 HTML 文件引用。
*   确保 Tailwind CSS 脚本及 Google Fonts 可正常访问（建议生产环境本地化这些资源以提高加载速度）。

### 4. 认证处理
*   所有 API 请求 Header 中需携带用户认证 Token（如 `Authorization: Bearer <token>`）。
*   若 Token 失效，前端需重定向至登录页面（需确认登录页 URL）。

### 5. 交互行为绑定
需要修改 HTML 中的静态 `onclick` 事件为实际的 JS 逻辑：

*   **index.html**:
    *   **历史作业 Tab**: 点击 `{点击这里}` 需绑定 Clipboard API 复制当前 URL。
    *   **保存按钮**: 移除 `alert`，绑定 `POST /save` 接口，成功后更新 "内容已于 XX:XX 自动保存" 提示。
    *   **提交按钮**: 移除 `href` 跳转，绑定 `POST /submit` 接口。成功后使用 `window.location.href` 跳转至 `homework_done.html`。
*   **homework_done.html**:
    *   **再写一份按钮**: 绑定跳转回 `index.html` 的逻辑。

### 6. 图片上传对接
*   在 `index.html` 中，监听 `.image-upload-input` 的 `change` 事件。
*   获取文件对象，构造 `FormData`，调用 `POST /api/upload/image`。
*   获取返回的 URL，调用 Quill/Editor 的 `insertEmbed` 方法将图片插入编辑器光标处。

