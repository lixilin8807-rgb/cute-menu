-- Migration: 为今日菜单添加留言功能
-- 在 today_menu 表中新增 note 字段
-- 运行方式: 在 Supabase Dashboard → SQL Editor 中执行此脚本

ALTER TABLE today_menu ADD COLUMN IF NOT EXISTS note TEXT;

-- 验证
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'today_menu';
