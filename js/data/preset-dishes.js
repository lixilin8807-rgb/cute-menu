/* ============================================================
   50道预设家常菜数据
   ============================================================ */

const PresetDishes = (function () {
  const dishes = [
    // ===== 荤菜（15道）=====
    { id: 'p001', name: '红烧肉', category: '荤菜', is_preset: true },
    { id: 'p002', name: '鱼香肉丝', category: '荤菜', is_preset: true },
    { id: 'p003', name: '宫保鸡丁', category: '荤菜', is_preset: true },
    { id: 'p004', name: '糖醋排骨', category: '荤菜', is_preset: true },
    { id: 'p005', name: '回锅肉', category: '荤菜', is_preset: true },
    { id: 'p006', name: '红烧鸡块', category: '荤菜', is_preset: true },
    { id: 'p007', name: '青椒肉丝', category: '荤菜', is_preset: true },
    { id: 'p008', name: '可乐鸡翅', category: '荤菜', is_preset: true },
    { id: 'p009', name: '孜然牛肉', category: '荤菜', is_preset: true },
    { id: 'p010', name: '红烧排骨', category: '荤菜', is_preset: true },
    { id: 'p011', name: '蒜蓉大虾', category: '荤菜', is_preset: true },
    { id: 'p012', name: '酱爆肉丁', category: '荤菜', is_preset: true },
    { id: 'p013', name: '葱爆羊肉', category: '荤菜', is_preset: true },
    { id: 'p014', name: '清蒸鲈鱼', category: '荤菜', is_preset: true },
    { id: 'p015', name: '红烧带鱼', category: '荤菜', is_preset: true },

    // ===== 素菜（12道）=====
    { id: 'p016', name: '西红柿炒鸡蛋', category: '素菜', is_preset: true },
    { id: 'p017', name: '麻婆豆腐', category: '素菜', is_preset: true },
    { id: 'p018', name: '手撕包菜', category: '素菜', is_preset: true },
    { id: 'p019', name: '酸辣土豆丝', category: '素菜', is_preset: true },
    { id: 'p020', name: '蒜蓉西兰花', category: '素菜', is_preset: true },
    { id: 'p021', name: '地三鲜', category: '素菜', is_preset: true },
    { id: 'p022', name: '干煸四季豆', category: '素菜', is_preset: true },
    { id: 'p023', name: '蚝油生菜', category: '素菜', is_preset: true },
    { id: 'p024', name: '韭菜炒蛋', category: '素菜', is_preset: true },
    { id: 'p025', name: '红烧茄子', category: '素菜', is_preset: true },
    { id: 'p026', name: '清炒时蔬', category: '素菜', is_preset: true },
    { id: 'p027', name: '家常豆腐', category: '素菜', is_preset: true },

    // ===== 汤品（8道）=====
    { id: 'p028', name: '番茄蛋花汤', category: '汤品', is_preset: true },
    { id: 'p029', name: '紫菜蛋花汤', category: '汤品', is_preset: true },
    { id: 'p030', name: '排骨玉米汤', category: '汤品', is_preset: true },
    { id: 'p031', name: '酸辣汤', category: '汤品', is_preset: true },
    { id: 'p032', name: '冬瓜排骨汤', category: '汤品', is_preset: true },
    { id: 'p033', name: '豆腐蘑菇汤', category: '汤品', is_preset: true },
    { id: 'p034', name: '萝卜排骨汤', category: '汤品', is_preset: true },
    { id: 'p035', name: '鸡汤', category: '汤品', is_preset: true },

    // ===== 主食（15道）=====
    { id: 'p036', name: '蛋炒饭', category: '主食', is_preset: true },
    { id: 'p037', name: '番茄鸡蛋面', category: '主食', is_preset: true },
    { id: 'p038', name: '炸酱面', category: '主食', is_preset: true },
    { id: 'p039', name: '饺子', category: '主食', is_preset: true },
    { id: 'p040', name: '馄饨', category: '主食', is_preset: true },
    { id: 'p041', name: '扬州炒饭', category: '主食', is_preset: true },
    { id: 'p042', name: '葱油拌面', category: '主食', is_preset: true },
    { id: 'p043', name: '炒米粉', category: '主食', is_preset: true },
    { id: 'p044', name: '馒头', category: '主食', is_preset: true },
    { id: 'p045', name: '花卷', category: '主食', is_preset: true },
    { id: 'p046', name: '包子', category: '主食', is_preset: true },
    { id: 'p047', name: '煎饼', category: '主食', is_preset: true },
    { id: 'p048', name: '烧卖', category: '主食', is_preset: true },
    { id: 'p049', name: '炒面', category: '主食', is_preset: true },
    { id: 'p050', name: '捞面', category: '主食', is_preset: true }
  ];

  function getAll() {
    return [...dishes];
  }

  function getByCategory(category) {
    if (!category || category === '全部') return getAll();
    return dishes.filter(d => d.category === category);
  }

  function getById(id) {
    return dishes.find(d => d.id === id) || null;
  }

  function search(keyword) {
    if (!keyword || !keyword.trim()) return getAll();
    const kw = keyword.trim().toLowerCase();
    return dishes.filter(d => d.name.toLowerCase().includes(kw));
  }

  return { getAll, getByCategory, getById, search };
})();
