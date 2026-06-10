# 技术栈说明

## 概述

本项目采用纯前端技术 + BaaS（后端即服务）架构，无需搭建服务器。

## 前端技术

### 核心技术
- **HTML5**：语义化标签，移动端 viewport
- **CSS3**：自定义属性、Flexbox、Grid、过渡动画
- **JavaScript ES6+**：模块化、async/await、箭头函数

### 架构模式
- **SPA（单页应用）**：Hash-based 路由，所有页面在同一个 HTML 文件中
- **模块化**：每个页面独立 JS 文件，通过全局 app 对象协调
- **状态管理**：集中式状态对象 `app.state`，页面间通过事件通信

### 没有使用的技术（刻意避免）
- ❌ 不使用 npm / webpack / vite 等构建工具
- ❌ 不使用 React / Vue / Angular 框架
- ❌ 不使用 TypeScript
- ✅ 所有依赖通过 CDN 引入，0 构建步骤

### CDN 依赖
```html
<!-- Supabase JS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 后端服务（Supabase）

### 什么是 Supabase
- 开源 Firebase 替代品
- 提供 PostgreSQL 数据库 + RESTful API + 实时订阅
- 免费额度：500MB 数据库、50,000 月活用户、2GB 带宽

### 使用的 Supabase 功能
| 功能 | 用途 |
|------|------|
| Database | 存储所有业务数据（5张表） |
| REST API | 前端通过 JS SDK 读写数据 |
| Realtime | 家庭组成员实时同步菜品变更 |
| Row Level Security | 基于 family_id 的数据隔离 |

### Supabase JS SDK 基本用法
```javascript
// 初始化
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 查询
const { data, error } = await supabase
  .from('dishes')
  .select('*')
  .eq('family_id', familyId);

// 插入
const { data, error } = await supabase
  .from('today_menu')
  .insert({ family_id, dish_id, date, added_by });

// 删除
const { error } = await supabase
  .from('today_menu')
  .delete()
  .eq('id', itemId);

// 实时订阅
supabase
  .channel('menu-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'today_menu' }, callback)
  .subscribe();
```

## PWA 技术

### manifest.json
- 定义应用名称、图标、主题色
- 支持 `display: standalone`（全屏无浏览器边框）

### Service Worker
- 缓存静态资源（CSS、JS、HTML）
- 离线回退页面
- 策略：Cache First（优先使用缓存，后台更新）

## 存储方案

### 云端存储（Supabase）
- 家庭组数据、菜品数据、今日菜单、冰箱食材
- 需要网络连接

### 本地存储（localStorage）
- deviceId（设备唯一标识）
- nickname（用户昵称）
- familyId（当前家庭组ID）
- 当前页面状态

### 浏览器数据库（IndexedDB - 可选）
- 离线数据缓存
- 网络恢复后自动同步

## 部署方案

### 推荐：Vercel
- 免费静态托管
- 自动 HTTPS
- 全球 CDN
- 从 GitHub 自动部署

### 备选：Netlify
- 同上，功能类似

### 最小方案：本地文件
- 直接在手机 Chrome 中打开本地 HTML
- 缺点：不能安装 PWA、不能 HTTPS、Service Worker 受限

## 浏览器兼容性

### 目标浏览器
- Android Chrome 90+
- 支持 PWA、Service Worker、CSS Grid、CSS 自定义属性

### 不支持的浏览器
- iOS Safari（后续可适配）
- 微信内置浏览器（部分 CSS 不兼容）
