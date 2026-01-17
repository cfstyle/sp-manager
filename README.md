<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 存储过程管理器 (SP Manager)

这是一个基于 Vue 3 + Element Plus 的可视化存储过程管理平台，旨在简化存储过程的检索、版本控制与协作。

## 本地运行

**前置条件:**  Node.js (建议 v16+)


1. 安装依赖:
   `npm install`
2. 在 [.env.local](.env.local) 中配置您的 `GEMINI_API_KEY` (如适用)
3. 启动开发服务器:
   `npm run dev`

## 项目功能与核心技术

### 核心功能
- **全文检索**: 毫秒级定位关键逻辑与代码片段。
- **在线编辑**: 集成 Monaco Editor (支持 SQL 汉化及智能提示)。
- **版本历史**: 记录所有变更，并支持一键对比 (Diff) 与回滚。
- **业务资产化**: 强制要求输入业务描述，确保技术资产的业务价值清晰可见。
- **动态定义识别**: 自动识别 SQL 代码中的数据库名与存储过程名，支持大小写不敏感检测。

### 技术栈
- **前端框架**: Vue 3 (Composition API)
- **UI 组件库**: Element Plus
- **编辑器**: Monaco Editor
- **工程化**: Vite + TypeScript
- **设计风格**: Tailwind CSS (Lucide 图标)

### 项目配置记录
- **package.json**: 已配置项目元数据、依赖项及启动脚本。
- **.gitignore**: 包含了必要的忽略规则（环境文件、系统文件等）。
- **国际化**: 已通过 `vite-plugin-monaco-editor-nls` 完成编辑器深度汉化。
- **代码规范**: 支持 Prettier 格式化。
