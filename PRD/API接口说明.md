# 作业系统前后端接口说明文档

## 确认结果

✅ **修改过程中未改动任何前后端接口**

本次优化仅涉及：
- CSS样式优化（界面布局、深色模式）
- 前端交互功能（主题切换、Markdown支持）
- 未修改任何API调用、接口URL或数据格式

---

## 一、外部资源依赖（CDN）

### 1.1 JavaScript库和Vue应用模块

| 资源地址                                                                       | 作用                                 | 状态                   |
| ------------------------------------------------------------------------------ | ------------------------------------ | ---------------------- |
| `https://cdn.yitang.top/yitang/prod/chunk-vue-b9819803cb-20251105154341.js`    | Vue.js核心库                         | 必需                   |
| `https://cdn.yitang.top/yitang/prod/chunk-libs-c58599daee-20251105154341.js`   | 工具库（lodash等）                   | 必需                   |
| `https://cdn.yitang.top/yitang/prod/chunk-lodash-ae272d1656-20251105154341.js` | Lodash工具函数库                     | 必需                   |
| `https://cdn.yitang.top/yitang/prod/main-6e7f5214e3.js`                        | **Vue应用主入口（包含所有API调用）** | **必需 - 包含API逻辑** |
| `https://cdn.yitang.top/yitang/prod/vendors~homework-edit-*.js`                | 作业编辑模块                         | 必需                   |
| `https://cdn.yitang.top/yitang/prod/homework-edit-*.js`                        | 作业编辑功能                         | 必需                   |
| `https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js`                     | Markdown解析库（本次新增）           | 可选                   |

### 1.2 样式和字体资源

| 资源地址                                                                   | 作用           | 状态 |
| -------------------------------------------------------------------------- | -------------- | ---- |
| `https://cdn.yitang.top/iconfont/20220717/iconfont.css`                    | 图标字体       | 必需 |
| `https://cdn.yitang.top/yitang-fe-static/assets/font/*.ttf`                | 自定义字体文件 | 可选 |
| `https://cdn.yitang.top/yitang-fe-static/assets/img/homework/bg_title.png` | 标题背景图     | 可选 |

### 1.3 第三方分析工具

| 资源地址                                                                               | 作用             | 状态 |
| -------------------------------------------------------------------------------------- | ---------------- | ---- |
| `https://hm.baidu.com/hm.js?b86d6f2795c5a7f47ee0c942cd4d1488`                          | 百度统计         | 可选 |
| `https://sf1-scmcdn-tos.pstatp.com/goofy/log-sdk/collect/collect-autotrack-rangers.js` | 字节跳动数据统计 | 可选 |

---

## 二、后端API接口

⚠️ **注意**：API接口定义在压缩后的JavaScript文件中（`main-*.js`），具体端点需通过以下方式获取：

### 2.1 推断的API接口（基于Vue应用行为）

根据应用功能和URL路径推断，可能的API端点包括：

#### 作业相关接口

| 接口路径（推断）                                 | 方法 | 作用             | 推测位置        |
| ------------------------------------------------ | ---- | ---------------- | --------------- |
| `/api/homework/get` 或 `/homework/:id`           | GET  | 获取作业详情     | Vue路由/API调用 |
| `/api/homework/save` 或 `/homework/:id/save`     | POST | 保存作业（暂存） | 暂存按钮        |
| `/api/homework/submit` 或 `/homework/:id/submit` | POST | 提交作业         | 提交按钮        |
| `/api/homework/update` 或 `/homework/:id/update` | PUT  | 更新作业内容     | 自动保存功能    |

#### 用户相关接口

| 接口路径（推断）  | 方法 | 作用         | 推测位置   |
| ----------------- | ---- | ------------ | ---------- |
| `/api/user/info`  | GET  | 获取用户信息 | 页面初始化 |
| `/api/user/login` | POST | 用户登录验证 | 访问控制   |

#### 课程相关接口

| 接口路径（推断）  | 方法 | 作用         | 推测位置 |
| ----------------- | ---- | ------------ | -------- |
| `/api/course/:id` | GET  | 获取课程信息 | 页面头部 |

### 2.2 如何查看实际API接口

1. **浏览器开发者工具**：
   - 打开页面，按F12
   - 切换到"Network"（网络）标签
   - 执行操作（保存、提交等）
   - 查看XHR/Fetch请求，找到API调用

2. **查看Vue应用源码**：
   - API配置通常在`main-*.js`或相关Vue组件中
   - 查找`axios`、`fetch`或`$http`调用
   - 查找`baseURL`或`API_BASE_URL`配置

3. **URL路径推断**：
   - 当前页面URL：`https://yitang.top/homework/D24Q690b18f8d450/edit`
   - 基础域名：`yitang.top` 或 `api.yitang.top`
   - API前缀可能是：`/api` 或 `/api/v1`

---

## 三、接口保留确认

✅ **当前版本已保留所有接口**

### 3.1 保留的内容

1. ✅ 所有Vue应用JavaScript文件（包含API调用逻辑）
2. ✅ 所有CDN资源引用
3. ✅ 所有HTML结构和数据属性
4. ✅ 原有的事件绑定和数据绑定

### 3.2 本次新增的内容

1. ✅ CSS变量系统（不影响API）
2. ✅ 主题切换功能（纯前端，使用localStorage）
3. ✅ Markdown支持（纯前端功能）
4. ✅ 界面样式优化（不影响数据流）

---

## 四、离线版本处理方案

对于离线版本（`offline/`目录），将：

1. ❌ **禁用API调用**：拦截所有网络请求，返回模拟数据
2. ❌ **移除外部CDN依赖**：使用本地资源或内联代码
3. ✅ **保留UI和样式**：确保界面正常显示
4. ✅ **保留主题切换和Markdown功能**：纯前端功能正常工作

---

## 五、接口功能说明（基于UI推断）

### 5.1 作业编辑接口

**保存接口**：
- **触发时机**：点击"暂存"按钮或自动保存
- **发送数据**：作业内容（JSON格式，包含各题目答案）
- **返回数据**：保存状态、时间戳

**提交接口**：
- **触发时机**：点击"提交"按钮
- **发送数据**：完整作业内容、公开意愿、评分等
- **返回数据**：提交状态、作业ID、学分

### 5.2 数据格式推测

```javascript
// 保存/提交的数据格式（推测）
{
  homeworkId: "D24Q690b18f8d450",
  questions: [
    {
      id: "q1",
      answer: "富文本内容（Delta格式或HTML）",
      type: "text"
    },
    // ... 其他题目
  ],
  publicWill: "愿意" | "不愿意" | "沟通后确认",
  npsScore: 1-10,
  updatedAt: "2025-11-10 15:27:14"
}
```

---

## 六、下一步操作

1. ✅ 确认所有接口已保留（已完成）
2. 📝 创建接口详细文档（需要实际测试）
3. 🔧 创建离线版本（进行中）

---

## 七、注意事项

1. **API接口详情**：由于代码被压缩，具体接口路径需要通过浏览器Network面板实际查看
2. **认证机制**：可能使用Cookie、Token或Session进行身份验证
3. **跨域问题**：离线版本需要处理CORS问题
4. **数据格式**：作业内容可能使用Quill Delta格式或HTML格式存储

---

**最后更新时间**：2025年
**维护者**：AI Assistant

