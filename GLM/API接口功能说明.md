# API接口功能说明

## 重要说明

⚠️ **注意**：参考文件（HW已填写版本.html 和 HW未填写版本.html）**不包含任何具体的API接口实现**。

这些文件实际上是：
- 纯前端HTML模板
- 通过Vue.js框架动态加载内容
- 真实的业务逻辑在压缩后的JavaScript文件中

## 加载的JavaScript文件分析

### 1. chunk-babel-96c1f1607e-20251219115912.js
- **功能**：Babel转译相关代码
- **作用**：提供ES6+语法支持

### 2. chunk-libs-c58599daee-20251219115912.js
- **功能**：第三方库集合
- **可能包含**：常用的JavaScript库和工具函数

### 3. chunk-lodash-ae272d1656-20251219115912.js
- **功能**：Lodash工具库
- **作用**：提供实用的工具函数（数组、对象操作等）

### 4. chunk-vue-b9819803cb-20251219115912.js
- **功能**：Vue.js框架核心
- **作用**：前端框架，负责数据绑定和组件渲染

### 5. main-102fe4208a.js
- **功能**：应用主逻辑
- **包含**：具体的业务实现和API调用
- **状态**：压缩混淆，无法直接分析

## 可能的API接口（推测）

基于作业系统的特性，可能包含以下接口：

### 1. 用户相关
```
GET /api/user/info          # 获取用户信息
POST /api/auth/login        # 用户登录
```

### 2. 作业相关
```
GET /api/homework/list      # 获取作业列表
GET /api/homework/:id       # 获取作业详情
POST /api/homework/:id/submit # 提交作业
GET /api/homework/:id/draft  # 获取草稿
POST /api/homework/:id/save  # 保存草稿
```

### 3. 题目相关
```
GET /api/questions/:homeworkId # 获取作业题目
POST /api/answers/submit       # 提交答案
```

## 我们的实现

在 `GLM/index.html` 中，我们采用了**纯前端模拟**的方式：

1. **数据存储**：使用localStorage模拟后端存储
2. **提交功能**：模拟提交，数据仅在控制台输出
3. **草稿功能**：完全前端实现，保存到浏览器本地

### 示例代码结构
```javascript
// 模拟数据
const homeworkData = {
  title: "一堂作业系统",
  questions: [...]
};

// 模拟API调用
saveDraft() {
  // 模拟保存到"后端"
  localStorage.setItem('homework_draft', data);
}

submit() {
  // 模拟提交到"后端"
  console.log('提交的答案:', answers);
  this.showNotification('作业提交成功！', 'success');
}
```

## 如需真实后端集成

如果需要连接真实后端，需要：

1. **修改API调用方式**
   ```javascript
   // 替换localStorage为真实API调用
   async saveDraft() {
     const response = await fetch('/api/homework/draft', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(data)
     });
   }
   ```

2. **添加错误处理**
   ```javascript
   try {
     const result = await apiCall();
   } catch (error) {
     this.showNotification('操作失败', 'error');
   }
   ```

3. **添加加载状态**
   ```javascript
   this.loading = true;
   await apiCall();
   this.loading = false;
   ```

## 总结

- 参考文件中的实际API接口不可见（代码已压缩）
- 我们的实现是完整的纯前端解决方案
- 如需后端集成，需要根据具体API规范进行适配