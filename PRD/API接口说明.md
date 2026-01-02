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
**Response Data (Matches `homework_done.html` implementation):**
```json
{
  "header": {
    "title": "《业务公式实操1：建立公式篇》",
    "date": "2026-01-02",
    "score": "6",
    "isExcellent": true // 控制"优秀作业"印章显示的布尔值
  },
  "userInfo": {
    "name": "Me",
    "avatarText": "Me"
  },
  "homeworkList": [
    {
      "order": 1,
      "title": "第一个作业：请根据自己的业务，写出三个公式。",
      "content": "<div>HTML Content...</div>" 
    },
    {
      "order": 2,
      "title": "第二个作业：案例推演题",
      "content": "<div>HTML Content...</div>"
    }
  ],
  "teacherComment": {
    "text": "总结得非常到位！尤其是第三个公式关于ROI的拆解，非常有见地..."
  },
  "satisfaction": {
    "courseScore": 10
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
建议通过 URL 路径参数传递 ID。

*   **index.html**: 部署路由应匹配 `/homework/:id/edit`。
    *   JS 逻辑需解析 URL 中的 `:id`，并调用 `GET /api/homework/:id` 初始化编辑器内容。
*   **homework_done.html**: 部署路由应匹配 `/homework/:id` 或 `/homework/:id/result`。
    *   **关键对接点**: 页面中已封装 `renderPage(data)` 函数。
    *   在页面加载时，调用接口获取数据，然后执行 `renderPage(response.data)` 即可自动填充所有内容（包括动态控制“优秀作业”印章的显示）。
    *   **开发模式**: 默认使用 `mockData` 常量进行演示。上线前请删除或注释掉 `mockData` 的初始化调用。

### 3. CSS 与 静态资源
*   确保 `index.css` 已正确部署并被两个 HTML 文件引用。
*   确保 `share-generator.js`、`html2canvas`、`qrcodejs` 资源可正常加载。
*   **印章资源**: 优秀作业印章图片路径为 `https://cdn.yitang.top/yitang-fe-static/assets/img/homework/stamp.png` (已在 HTML 中硬编码，可根据需要替换)。

### 4. 认证处理
*   所有 API 请求 Header 中需携带用户认证 Token（如 `Authorization: Bearer <token>`）。

### 5. 交互行为绑定 (Updated)
已在 `index.html` 中通过内联 Script 实现了以下 API 也就是占位符函数，部署时请根据实际业务逻辑修改 `const API_BASE_URL` 及具体函数实现：

*   **`initPage()`**: 页面加载时调用，自动从 URL 获取 `id` 并调用 `GET /api/homework/{id}`。
*   **`saveDraft()`**: 绑定了顶部的保存按钮，调用 `POST /api/homework/{id}/save`。
*   **`submitHomework()`**: 绑定了底部的提交按钮，调用 `POST /api/homework/{id}/submit`。
*   **`loadHistory()`**: 绑定了“历史作业”标签页的点击事件，调用 `GET /api/homework/{id}/history`。
*   **`uploadImage(file)`**: 预留了图片上传函数，需配合编辑器逻辑调用。

*   建议在 `script.js` 或拦截逻辑中，将文件上传后获得的 URL 插入到编辑器中。
*   当前 `script.js` 中的图片上传逻辑仅为本地预览 (`FileReader`)。

### 7. 环境适配：微信 (WeChat Environment)

如果已部署的页面需要在微信内运行，建议在 `index.html` 的 `<head>` 中加入以下代码以禁止微信自动调整字体大小 (iOS/Android Compat)：

```html
<script>
    (function () {
        if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
            handleFontSize();
        } else {
            if (document.addEventListener) {
                document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
            }
        }
        function handleFontSize() {
            WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize': 0 });
            WeixinJSBridge.on('menu:setfont', function () {
                WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize': 0 });
            });
        }
    })();
</script>
```

### 8. 移除冗余逻辑
*   部署时请注意移除 `index.html` 底部为了演示而添加的 `Mock Data` 生成代码（如有），以及上述占位符脚本中的 `setTimeout` 模拟延迟。

