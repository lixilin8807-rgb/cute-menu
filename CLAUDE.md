# CLAUDE.md — 家庭趣味点菜 PWA 开发指引

## 项目概述

为家庭用户开发的趣味点菜 PWA，运行于安卓手机浏览器。技术栈：HTML/CSS/JS + Supabase。

## 标准文件路径速查表

| 用途 | 路径 |
|------|------|
| 需求规格 | [docs/requirements.md](docs/requirements.md) |
| UI 设计规范 | [DESIGN.md](DESIGN.md)（Warm Whiskers 设计系统）|
| 技术栈说明 | [docs/tech-stack.md](docs/tech-stack.md) |
| 数据库设计 | [docs/database-schema.md](docs/database-schema.md) |
| 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) |
| 开发日志 | [devlog/](devlog/) （按日期：YYYY-MM-DD.md） |
| 主入口 | [index.html](index.html) |
| 全局样式 | [css/style.css](css/style.css) |
| 应用核心 | [js/app.js](js/app.js) |
| Supabase 操作 | [js/supabase.js](js/supabase.js) |
| 工具函数 | [js/utils.js](js/utils.js) |
| 预设菜品数据 | [js/data/preset-dishes.js](js/data/preset-dishes.js) |
| 首页逻辑 | [js/pages/home.js](js/pages/home.js) |
| 菜单页逻辑 | [js/pages/menu.js](js/pages/menu.js) |
| 全部菜品页逻辑 | [js/pages/all-dishes.js](js/pages/all-dishes.js) |
| 菜品详情逻辑 | [js/pages/dish-detail.js](js/pages/dish-detail.js) |
| 冰箱页逻辑 | [js/pages/fridge.js](js/pages/fridge.js) |
| 我的页逻辑 | [js/pages/profile.js](js/pages/profile.js) |

## 开发工作流

1. **开始每步前**：阅读 `docs/execution-steps.md` 中对应步骤的目标和验收标准
2. **写样式时**：严格参照 [DESIGN.md](DESIGN.md) 中的 Warm Whiskers 设计系统（Neumorphism 阴影、Plus Jakarta Sans 字体、马卡龙色系、8px 网格间距）
3. **写数据结构时**：参照 `docs/database-schema.md` 中的表定义
4. **每步完成后**：
   - 更新 `devlog/YYYY-MM-DD.md`，记录完成事项和待办事项
   - 将 `docs/execution-steps.md` 中对应步骤标记为完成

## 编码规范

### HTML
- 所有页面容器放在 `index.html` 中，使用 `<div id="page-xxx">` 命名
- 使用语义化标签，移动端优先

### CSS
- 使用 CSS 自定义属性（`--color-xxx`、`--radius-xxx` 等）
- 所有卡片和按钮使用大圆角（16px-24px，按钮用 pill 9999px）
- **Warm Whiskers 设计系统**：主色 #984630（深红棕），容器色 #F28C71（珊瑚），背景 #FFF8F6（奶油粉）
- Neumorphism 双阴影体系：凸起元素用白色+棕色双阴影，输入框用凹陷内阴影
- 文字色 #251915（深可可），次要文字用同色 70% 透明度
- 字体 Plus Jakarta Sans，字重 Medium(500) 用于正文，ExtraBold(800) 用于大标题
- 间距按 8px 网格（--sp-1:4px 至 --sp-10:40px）
- 响应式设计，以 375px-414px 宽度为基准（安卓手机）

### JavaScript
- ES6+ 语法，使用 `async/await`
- 每个页面一个独立模块，通过 `app.js` 统一管理
- 数据操作统一通过 `supabase.js` 或 `utils.js`（localStorage降级）
- 全局状态存储在 `app.state` 对象中

### 数据库
- 表名使用 snake_case
- 主键使用 uuid 类型
- 外键关联使用 `family_id`
- 预设菜品的 `family_id` 为 null（所有家庭共享）

## 设计原则

- **移动端优先**：以手机屏幕为基准设计
- **触控友好**：按钮最小 44px × 44px
- **反馈明确**：每个操作都有视觉反馈（动画/颜色变化）
- **温暖亲切**：暖色调、圆角、猫咪元素
- **零门槛**：无需登录注册，首次使用输入昵称即可

## 注意事项

- 用户是完全不懂代码的小白，部署步骤需要写详细
- 应用运行在安卓 Chrome 上，需测试 WebKit 兼容性
- Supabase JS SDK 从 CDN 引入，不需要 npm/build 工具
- 所有代码文件使用 UTF-8 编码
- 中文界面，预设菜品使用中文菜名
