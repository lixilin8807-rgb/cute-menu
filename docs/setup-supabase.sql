-- ============================================================
-- 趣味点菜 PWA — Supabase 数据库初始化脚本 (修复版)
-- ============================================================

-- 0. 清理旧表（如果存在）
-- ============================================================
DROP TABLE IF EXISTS fridge_items CASCADE;
DROP TABLE IF EXISTS today_menu CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- 1. 创建表（使用 TEXT 类型主键，兼容前端）
-- ============================================================

-- 家庭组
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_families_share_code ON families(share_code);

-- 家庭成员
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, device_id)
);
CREATE INDEX idx_family_members_family ON family_members(family_id);

-- 菜品库
CREATE TABLE dishes (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  external_link TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dishes_family ON dishes(family_id);
CREATE INDEX idx_dishes_category ON dishes(category);

-- 今日菜单
CREATE TABLE today_menu (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_menu_family_date ON today_menu(family_id, date);
CREATE UNIQUE INDEX idx_menu_unique ON today_menu(family_id, dish_id, date);

-- 冰箱食材
CREATE TABLE fridge_items (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_date DATE,
  expiry_date DATE,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fridge_family ON fridge_items(family_id);
CREATE INDEX idx_fridge_expiry ON fridge_items(expiry_date);

-- 2. 启用 RLS
-- ============================================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE today_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;

-- 3. RLS 策略
-- ============================================================
CREATE POLICY "allow_all_families" ON families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_dishes" ON dishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_menu" ON today_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fridge" ON fridge_items FOR ALL USING (true) WITH CHECK (true);

-- 4. 插入50道预设菜品
-- ============================================================
INSERT INTO dishes (id, family_id, name, category, is_preset) VALUES
  ('p001',NULL,'红烧肉','荤菜',TRUE),
  ('p002',NULL,'鱼香肉丝','荤菜',TRUE),
  ('p003',NULL,'宫保鸡丁','荤菜',TRUE),
  ('p004',NULL,'糖醋排骨','荤菜',TRUE),
  ('p005',NULL,'回锅肉','荤菜',TRUE),
  ('p006',NULL,'红烧鸡块','荤菜',TRUE),
  ('p007',NULL,'青椒肉丝','荤菜',TRUE),
  ('p008',NULL,'可乐鸡翅','荤菜',TRUE),
  ('p009',NULL,'孜然牛肉','荤菜',TRUE),
  ('p010',NULL,'红烧排骨','荤菜',TRUE),
  ('p011',NULL,'蒜蓉大虾','荤菜',TRUE),
  ('p012',NULL,'酱爆肉丁','荤菜',TRUE),
  ('p013',NULL,'葱爆羊肉','荤菜',TRUE),
  ('p014',NULL,'清蒸鲈鱼','荤菜',TRUE),
  ('p015',NULL,'红烧带鱼','荤菜',TRUE),
  ('p016',NULL,'西红柿炒鸡蛋','素菜',TRUE),
  ('p017',NULL,'麻婆豆腐','素菜',TRUE),
  ('p018',NULL,'手撕包菜','素菜',TRUE),
  ('p019',NULL,'酸辣土豆丝','素菜',TRUE),
  ('p020',NULL,'蒜蓉西兰花','素菜',TRUE),
  ('p021',NULL,'地三鲜','素菜',TRUE),
  ('p022',NULL,'干煸四季豆','素菜',TRUE),
  ('p023',NULL,'蚝油生菜','素菜',TRUE),
  ('p024',NULL,'韭菜炒蛋','素菜',TRUE),
  ('p025',NULL,'红烧茄子','素菜',TRUE),
  ('p026',NULL,'清炒时蔬','素菜',TRUE),
  ('p027',NULL,'家常豆腐','素菜',TRUE),
  ('p028',NULL,'番茄蛋花汤','汤品',TRUE),
  ('p029',NULL,'紫菜蛋花汤','汤品',TRUE),
  ('p030',NULL,'排骨玉米汤','汤品',TRUE),
  ('p031',NULL,'酸辣汤','汤品',TRUE),
  ('p032',NULL,'冬瓜排骨汤','汤品',TRUE),
  ('p033',NULL,'豆腐蘑菇汤','汤品',TRUE),
  ('p034',NULL,'萝卜排骨汤','汤品',TRUE),
  ('p035',NULL,'鸡汤','汤品',TRUE),
  ('p036',NULL,'蛋炒饭','主食',TRUE),
  ('p037',NULL,'番茄鸡蛋面','主食',TRUE),
  ('p038',NULL,'炸酱面','主食',TRUE),
  ('p039',NULL,'饺子','主食',TRUE),
  ('p040',NULL,'馄饨','主食',TRUE),
  ('p041',NULL,'扬州炒饭','主食',TRUE),
  ('p042',NULL,'葱油拌面','主食',TRUE),
  ('p043',NULL,'炒米粉','主食',TRUE),
  ('p044',NULL,'馒头','主食',TRUE),
  ('p045',NULL,'花卷','主食',TRUE),
  ('p046',NULL,'包子','主食',TRUE),
  ('p047',NULL,'煎饼','主食',TRUE),
  ('p048',NULL,'烧卖','主食',TRUE),
  ('p049',NULL,'炒面','主食',TRUE),
  ('p050',NULL,'捞面','主食',TRUE)
ON CONFLICT (id) DO NOTHING;
