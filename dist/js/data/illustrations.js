/* ============================================================
   插画/图片映射模块
   管理菜品图片、食材图片、空状态图片的查找与降级
   ============================================================ */

const Illustrations = (function () {

  // ============================================================
  //  菜品名 → 图片路径（当你放入 PNG 后，在此处取消注释对应条目）
  //  菜品 PNG 请放入 img/dishes/ 目录，文件名与菜品名一致
  // ============================================================
  const _dishMap = {
    // -- 荤菜 --
    // '红烧肉':     'img/dishes/红烧肉.png',
    // '鱼香肉丝':   'img/dishes/鱼香肉丝.png',
    // '宫保鸡丁':   'img/dishes/宫保鸡丁.png',
    // '糖醋排骨':   'img/dishes/糖醋排骨.png',
    // '回锅肉':     'img/dishes/回锅肉.png',
    // '红烧鸡块':   'img/dishes/红烧鸡块.png',
    // '青椒肉丝':   'img/dishes/青椒肉丝.png',
    // '可乐鸡翅':   'img/dishes/可乐鸡翅.png',
    // '孜然牛肉':   'img/dishes/孜然牛肉.png',
    // '红烧排骨':   'img/dishes/红烧排骨.png',
    // '蒜蓉大虾':   'img/dishes/蒜蓉大虾.png',
    // '酱爆肉丁':   'img/dishes/酱爆肉丁.png',
    // '葱爆羊肉':   'img/dishes/葱爆羊肉.png',
    // '清蒸鲈鱼':   'img/dishes/清蒸鲈鱼.png',
    // '红烧带鱼':   'img/dishes/红烧带鱼.png',

    // -- 素菜 --
    // '西红柿炒鸡蛋': 'img/dishes/西红柿炒鸡蛋.png',
    // '麻婆豆腐':   'img/dishes/麻婆豆腐.png',
    // '手撕包菜':   'img/dishes/手撕包菜.png',
    // '酸辣土豆丝': 'img/dishes/酸辣土豆丝.png',
    // '蒜蓉西兰花': 'img/dishes/蒜蓉西兰花.png',
    // '地三鲜':     'img/dishes/地三鲜.png',
    // '干煸四季豆': 'img/dishes/干煸四季豆.png',
    // '蚝油生菜':   'img/dishes/蚝油生菜.png',
    // '韭菜炒蛋':   'img/dishes/韭菜炒蛋.png',
    // '红烧茄子':   'img/dishes/红烧茄子.png',
    // '清炒时蔬':   'img/dishes/清炒时蔬.png',
    // '家常豆腐':   'img/dishes/家常豆腐.png',

    // -- 汤品 --
    // '番茄蛋花汤': 'img/dishes/番茄蛋花汤.png',
    // '紫菜蛋花汤': 'img/dishes/紫菜蛋花汤.png',
    // '排骨玉米汤': 'img/dishes/排骨玉米汤.png',
    // '酸辣汤':     'img/dishes/酸辣汤.png',
    // '冬瓜排骨汤': 'img/dishes/冬瓜排骨汤.png',
    // '豆腐蘑菇汤': 'img/dishes/豆腐蘑菇汤.png',
    // '萝卜排骨汤': 'img/dishes/萝卜排骨汤.png',
    // '鸡汤':       'img/dishes/鸡汤.png',

    // -- 主食 --
    // '蛋炒饭':     'img/dishes/蛋炒饭.png',
    // '番茄鸡蛋面': 'img/dishes/番茄鸡蛋面.png',
    // '炸酱面':     'img/dishes/炸酱面.png',
    // '饺子':       'img/dishes/饺子.png',
    // '馄饨':       'img/dishes/馄饨.png',
    // '扬州炒饭':   'img/dishes/扬州炒饭.png',
    // '葱油拌面':   'img/dishes/葱油拌面.png',
    // '炒米粉':     'img/dishes/炒米粉.png',
    // '馒头':       'img/dishes/馒头.png',
    // '花卷':       'img/dishes/花卷.png',
    // '包子':       'img/dishes/包子.png',
    // '煎饼':       'img/dishes/煎饼.png',
    // '烧卖':       'img/dishes/烧卖.png',
    // '炒面':       'img/dishes/炒面.png',
    // '捞面':       'img/dishes/捞面.png',
  };

  // ============================================================
  //  分类 fallback 图片
  // ============================================================
  const _categoryFallback = {
    '荤菜': 'img/dishes/default-meat.svg',
    '素菜': 'img/dishes/default-veggie.svg',
    '汤品': 'img/dishes/default-soup.svg',
    '主食': 'img/dishes/default-staple.svg',
  };

  // 通用 fallback（当连分类都没有匹配时）
  const DEFAULT_DISH_IMAGE = 'img/dishes/default.svg';

  // ============================================================
  //  冰箱食材图片映射
  //  图片请放入 img/fridge/ 目录
  // ============================================================
  const _fridgeMap = {
    // 放入对应 PNG 后取消注释即可启用：
    // '鸡蛋':   'img/fridge/鸡蛋.png',
    // '青菜':   'img/fridge/青菜.png',
    // '猪肉':   'img/fridge/猪肉.png',
    // '牛肉':   'img/fridge/牛肉.png',
    // '鸡肉':   'img/fridge/鸡肉.png',
    // '鱼肉':   'img/fridge/鱼肉.png',
    // '虾':     'img/fridge/虾.png',
    // '番茄':   'img/fridge/番茄.png',
    // '西红柿': 'img/fridge/番茄.png',
    // '洋葱':   'img/fridge/洋葱.png',
    // '土豆':   'img/fridge/土豆.png',
    // '胡萝卜': 'img/fridge/胡萝卜.png',
    // '西兰花': 'img/fridge/西兰花.png',
    // '豆腐':   'img/fridge/豆腐.png',
    // '蘑菇':   'img/fridge/蘑菇.png',
    // '黄瓜':   'img/fridge/黄瓜.png',
    // '辣椒':   'img/fridge/辣椒.png',
    // '姜':     'img/fridge/姜.png',
    // '蒜':     'img/fridge/蒜.png',
    // '葱':     'img/fridge/葱.png',
    // '牛奶':   'img/fridge/牛奶.png',
    // '奶酪':   'img/fridge/奶酪.png',
    // '黄油':   'img/fridge/黄油.png',
  };

  const DEFAULT_FRIDGE_IMAGE = 'img/fridge/default.svg';

  // ============================================================
  //  空状态图片
  // ============================================================
  const _emptyImages = {
    'menu':   'img/empty/menu-empty.png',
    'fridge': 'img/empty/fridge-empty.png',
  };

  // ============================================================
  //  公开方法
  // ============================================================

  /**
   * 获取菜品的展示图片路径
   * @param {string} dishName - 菜品名称
   * @param {string} [category] - 菜品分类（用于 fallback）
   * @returns {string} 图片路径
   */
  function getDishImage(dishName, category) {
    // 1. 精确匹配菜品名
    if (dishName && _dishMap[dishName]) {
      return _dishMap[dishName];
    }
    // 2. 按分类 fallback
    if (category && _categoryFallback[category]) {
      return _categoryFallback[category];
    }
    // 3. 通用 fallback
    return DEFAULT_DISH_IMAGE;
  }

  /**
   * 获取冰箱食材的展示图片路径
   * @param {string} ingredientName - 食材名称
   * @returns {string} 图片路径
   */
  function getFridgeImage(ingredientName) {
    if (ingredientName && _fridgeMap[ingredientName]) {
      return _fridgeMap[ingredientName];
    }
    return DEFAULT_FRIDGE_IMAGE;
  }

  /**
   * 获取空状态图片路径
   * @param {'menu'|'fridge'} pageType - 页面类型
   * @returns {string} 图片路径
   */
  function getEmptyImage(pageType) {
    return _emptyImages[pageType] || _emptyImages['menu'];
  }

  /**
   * 生成菜品的 <img> 标签
   * @param {string} src - 图片路径
   * @param {string} alt - 替代文本
   * @returns {string} HTML 字符串
   */
  function imgTag(src, alt) {
    return '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
  }

  /**
   * 生成食材图标的 <img> 标签（与 imgTag 相同）
   */
  function imgTagSimple(src, alt) {
    return '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
  }

  // ============================================================
  //  导出
  // ============================================================
  return {
    getDishImage,
    getFridgeImage,
    getEmptyImage,
    imgTag,
    imgTagSimple,
    DEFAULT_DISH_IMAGE,
    DEFAULT_FRIDGE_IMAGE,
  };
})();
