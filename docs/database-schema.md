# 数据库表结构设计

## 概述

使用 Supabase PostgreSQL 数据库，共 6 张业务表。所有表使用 uuid 主键，通过 `family_id` 外键关联家庭组。

## 表关系图

```
families (家庭组)
    │
    ├── family_members (家庭成员)
    │       └── family_id → families.id
    │
    ├── dishes (菜品 - 自定义)
    │       └── family_id → families.id (nullable, null = 预设)
    │
    ├── today_menu (今日菜单)
    │       ├── family_id → families.id
    │       ├── dish_id → dishes.id
    │       └── menu_notes (留言) → menu_id
    │
    └── fridge_items (冰箱食材)
            └── family_id → families.id
```

## 建表 SQL

### 1. families 表
```sql
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按共享码查询
CREATE INDEX idx_families_share_code ON families(share_code);
```

### 2. family_members 表
```sql
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, device_id)  -- 同一设备不能重复加入同一家庭组
);

-- 索引：按家庭组查询成员
CREATE INDEX idx_family_members_family ON family_members(family_id);
```

### 3. dishes 表
```sql
CREATE TABLE dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,  -- null = 预设菜品
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('荤菜', '素菜', '汤品', '主食')),
  image_url TEXT,
  external_link TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按家庭组查询、按分类查询
CREATE INDEX idx_dishes_family ON dishes(family_id);
CREATE INDEX idx_dishes_category ON dishes(category);
CREATE INDEX idx_dishes_preset ON dishes(is_preset);
```

### 4. today_menu 表
```sql
CREATE TABLE today_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按家庭组+日期查询
CREATE INDEX idx_menu_family_date ON today_menu(family_id, date);
-- 同一家庭组同一天不重复添加同一菜品
CREATE UNIQUE INDEX idx_menu_unique ON today_menu(family_id, dish_id, date);
```

### 5. fridge_items 表
```sql
CREATE TABLE fridge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_date DATE,
  expiry_date DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按家庭组查询、按保质期排序
CREATE INDEX idx_fridge_family ON fridge_items(family_id);
CREATE INDEX idx_fridge_expiry ON fridge_items(expiry_date);
```

### 6. menu_notes 表
```sql
CREATE TABLE menu_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id TEXT NOT NULL REFERENCES today_menu(id) ON DELETE CASCADE,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '家人',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按菜单项查询
CREATE INDEX idx_menu_notes_menu ON menu_notes(menu_id);
```

> **⚠️ 重要**：此表为新增表，需在 Supabase Dashboard SQL Editor 中手动执行建表 SQL。

## Row Level Security (RLS) 策略

```sql
-- 开启所有表的 RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE today_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_notes ENABLE ROW LEVEL SECURITY;

-- families: 任何已认证用户可读（通过共享码查找）
CREATE POLICY "families_read_by_code" ON families
  FOR SELECT USING (true);

-- families: 任何用户可创建
CREATE POLICY "families_insert_all" ON families
  FOR INSERT WITH CHECK (true);

-- dishes: 预设菜品(family_id IS NULL)所有人可读
CREATE POLICY "dishes_read_preset" ON dishes
  FOR SELECT USING (family_id IS NULL);

-- dishes: 家庭自定义菜品可读
CREATE POLICY "dishes_read_family" ON dishes
  FOR SELECT USING (family_id = current_setting('app.family_id')::uuid);

-- today_menu: 按家庭组隔离
CREATE POLICY "menu_crud_family" ON today_menu
  FOR ALL USING (family_id = current_setting('app.family_id')::uuid);

-- fridge_items: 按家庭组隔离
CREATE POLICY "fridge_crud_family" ON fridge_items
  FOR ALL USING (family_id = current_setting('app.family_id')::uuid);

-- menu_notes: 允许家庭成员操作
CREATE POLICY "menu_notes_allow_all" ON menu_notes
  FOR ALL USING (true);

-- family_members: 按家庭组隔离
CREATE POLICY "members_crud_family" ON family_members
  FOR ALL USING (family_id = current_setting('app.family_id')::uuid);
```

## 预设菜品数据

预设菜品的 `family_id` 为 `NULL`，`is_preset` 为 `TRUE`。所有家庭共享预设菜品库。

预设菜品分类统计：
- 荤菜：15道
- 素菜：12道
- 汤品：8道
- 主食：15道
- 合计：50道

详细菜品数据见 `js/data/preset-dishes.js`。
