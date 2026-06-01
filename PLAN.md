# /goal 构建 StackPilot AI

## 项目目标

构建一款 PC 端「全栈技术方案可视化配置平台」。

用户通过图形化界面选择技术栈、架构模式、部署方式和项目类型，系统实时生成 AI 可直接识别和使用的结构化技术方案。

生成结果支持：

- JSON 导出
- Markdown 导出
- 文本描述导出
- 一键复制
- AI Prompt 生成

---

## 项目名称

**StackPilot AI**

副标题：

AI-Driven Full Stack Solution Builder

中文名：

**AI 研发助手**

---

## 最终停止条件（Done Definition）

满足以下所有条件后停止：

### 1. 基础功能

用户可配置项目基础信息，包括：

- 项目名称
- 项目描述
- 项目类型
- 开发语言

### 2. 前端选型模块

支持：

- 框架：Vue3、React、Angular、原生 HTML
- UI：Element Plus、Ant Design、Tailwind CSS
- 构建：Vite、Webpack
- 状态管理：Pinia、Redux
- 请求库：Axios、Fetch
- 其他能力：TypeScript、SVG Icons、国际化

### 3. 后端选型模块

支持：

- 语言：Java、Python、Go、Node.js
- 框架：SpringBoot、Django、Express、NestJS
- API 风格：RESTful、GraphQL
- 认证：JWT、OAuth2
- 文档：Swagger/OpenAPI

### 4. 数据层模块

支持：

- 数据库：MySQL、PostgreSQL、MongoDB
- 缓存：Redis
- 检索：Elasticsearch

### 5. 运维部署模块

支持：

- 部署基础：Docker、Nginx
- 云平台：阿里云、腾讯云、AWS
- 环境：Dev、Test、Prod

### 6. 架构模块

支持：

- 单体架构
- 前后端分离
- 微服务
- MVC
- MVVM

### 7. 选型配置管理模块

支持用户对各类选项进行维护：

- 新增自定义选项（如自定义框架、中间件、云平台）
- 编辑内置选项文案与描述
- 删除不需要的选项
- 启用/禁用选项
- 配置项变更后实时参与 JSON / 文本 / Prompt 生成

### 8. AI 输出模块

实时生成：

#### JSON 结构

```json
{
  "projectName": "电商管理系统",
  "projectType": "后台管理系统",
  "frontend": {
    "framework": "Vue3",
    "ui": "Element Plus",
    "language": "TypeScript"
  },
  "backend": {
    "language": "Java",
    "framework": "SpringBoot"
  },
  "database": "MySQL",
  "cache": "Redis",
  "deploy": "Docker + Nginx",
  "architecture": "前后端分离"
}
```

#### 自然语言描述

示例：

- 项目名称：电商管理系统
- 前端：Vue3 + TypeScript + Element Plus + Axios
- 后端：Java + SpringBoot
- 数据库：MySQL
- 缓存：Redis
- 部署：Docker + Nginx
- 架构：前后端分离

#### AI Prompt 生成

示例：

```text
请根据以下技术方案生成完整项目：

项目类型：后台管理系统

前端：
Vue3 + TypeScript + Element Plus

后端：
SpringBoot

数据库：
MySQL

缓存：
Redis

要求：
- RBAC 权限系统
- JWT 认证
- Docker 部署
- OpenAPI 文档

生成完整目录结构、数据库设计、接口设计及部署脚本。
```

---

## 技术要求

前端技术栈：

- Vue3
- TypeScript
- Vite
- Element Plus
- Pinia

---

## 数据模型规范（Schema v1）

为保证 AI 输出稳定，统一采用 `camelCase` 字段命名，并固定顶层结构：

- `schemaVersion`：当前固定为 `1.0.0`
- `project`：项目基础信息（名称、描述、类型、语言）
- `frontend` / `backend` / `dataLayer` / `ops` / `architecture`：各模块选型
- `output`：自然语言描述与 prompt 片段

约束规则：

- 枚举值优先使用固定候选项，自定义项需标记 `isCustom: true`
- 不允许输出空对象；无值字段输出空数组或 `null`（按字段语义）
- 导出 JSON 必须包含 `schemaVersion`

---

## UI 要求

风格：

- 科技蓝
- 卡片式布局
- 深浅色主题切换

布局：

- 顶部导航栏
- 左侧技术选型菜单
- 右侧配置区域
- 底部实时预览区

---

## 兼容性矩阵

- 分辨率优先支持：1920×1080
- 最低可用分辨率：1366×768（允许信息折叠，不允许功能缺失）
- 浏览器：Chrome（最新稳定版）、Edge（最新稳定版）

---

## 验证方式

### 功能验证

- 技术配置正常保存
- 页面刷新状态恢复
- JSON 实时生成
- Prompt 实时生成
- 导出功能正常
- 选型项支持新增、编辑、删除、启用/禁用
- 自定义选项在刷新后可恢复

### 异常场景验证

- 本地存储数据损坏时可自动回退到默认配置并提示用户
- 生成内容遇到非法字符时可安全转义或提示修复
- 超长项目名/描述有长度限制与即时校验提示
- 导出失败时有明确错误提示与可重试机制

### 非功能验证

- 首屏加载时间 <= 2 秒（1920×1080，普通办公机）
- 配置变更后预览更新延迟 <= 200ms
- 单次导出耗时 <= 1 秒（JSON/Markdown/TXT）
- 连续操作 30 分钟无明显卡顿、无阻断性错误

### 导出验证

成功导出：

- JSON
- Markdown
- TXT

### UI 验证

- PC 端适配
- 1920×1080 正常显示
- 深色模式正常显示

---

## 里程碑（执行顺序）

### M1：项目骨架与基础配置

- 初始化 Vue3 + TypeScript + Vite + Element Plus + Pinia
- 搭建主布局（顶部 / 左侧 / 右侧 / 底部）
- 定义统一配置数据模型

### M2：选型模块完成

- 实现前端、后端、数据层、运维、架构模块表单
- 完成本地状态管理与配置联动
- 实现选型配置管理（新增/编辑/删除/启用禁用）
- 增加选型库维护规则（内置项保护、恢复默认）

### M3：AI 输出与导出

- 实时生成 JSON
- 实时生成自然语言描述
- 实时生成 AI Prompt
- 完成 JSON / Markdown / TXT 导出与一键复制
- 确保自定义选型项完整进入导出内容
- 完成 Schema v1 一致性校验（字段完整性、版本号、空值策略）

### M4：持久化与验证

- 页面刷新状态恢复（本地存储）
- 完成功能验证与 UI 验证
- 完成异常场景验证与非功能验证
- 修复问题并完成发布前检查

---

## 选型库维护规则

- 内置选项默认不可硬删除，仅支持禁用
- 支持“恢复默认选型库”（一键回滚内置配置）
- 自定义选项可新增、编辑、删除
- 支持导入/导出选型库（JSON）用于团队共享

---

## 交付物定义（M4）

- 可运行的 PC 端前端工程（开发与构建脚本可用）
- 一份标准配置示例（覆盖主要模块）
- 用户使用说明（配置、导出、恢复默认）
- 测试报告（功能/导出/UI/异常/非功能）
- 已知限制清单（暂不支持项与规避建议）

---

## 后续迭代方向（V2）

- AI 架构图生成
- ER 图生成
- OpenAPI 生成
- Docker Compose 生成
- Kubernetes 部署模板生成
- 微服务模板库
- 行业解决方案库

---

## 工作原则

1. 优先保证可运行
2. 每完成一个模块立即验证
3. 保持组件化设计
4. 保持配置驱动
5. 保证 AI 输出格式稳定

---

## 成功标准

用户无需编写任何代码，仅通过勾选配置即可生成：

- 技术方案
- AI Prompt
- JSON 配置
- Markdown 文档

并可直接交给 AI（ChatGPT、Codex、Claude、Gemini）生成完整项目代码。

---

## 产品化升级方向

**StackPilot AI -> AI Full Stack Workspace**

在方案生成能力基础上，进一步支持：

- PRD 生成
- 数据库设计生成
- API 设计生成
- 架构图生成
- Vue/React 项目骨架生成
- Docker 部署文件生成
