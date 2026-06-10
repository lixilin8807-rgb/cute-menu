/* ============================================================
   工具函数 — 趣味点菜 PWA
   ============================================================ */

const Utils = {

  /**
   * 生成唯一设备ID（存储在 localStorage）
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  },

  /**
   * 生成6位随机共享码（大写字母+数字）
   */
  generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆字符 I/O/0/1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  /**
   * 获取今天的日期字符串 YYYY-MM-DD
   */
  getToday() {
    const now = new Date();
    return this.formatDate(now);
  },

  /**
   * 格式化 Date 对象为 YYYY-MM-DD
   */
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * 格式化日期为中文显示
   */
  formatDateCN(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === this.formatDate(today)) return '今天';
    if (dateStr === this.formatDate(yesterday)) return '昨天';
    if (dateStr === this.formatDate(tomorrow)) return '明天';

    const m = date.getMonth() + 1;
    const d = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const w = weekdays[date.getDay()];
    return `${m}月${d}日 周${w}`;
  },

  /**
   * 日期加减天数
   */
  addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.formatDate(date);
  },

  /**
   * 防抖函数
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 随机从数组中取一个元素
   */
  randomPick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * 打乱数组（Fisher-Yates）
   */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /**
   * 根据分类获取标签 CSS 类名
   */
  getCategoryClass(category) {
    const map = {
      '荤菜': 'tag-meat',
      '素菜': 'tag-veggie',
      '汤品': 'tag-soup',
      '主食': 'tag-staple'
    };
    return map[category] || '';
  },

  /**
   * HTML 转义，防止 XSS
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 根据分类获取 emoji 图标
   */
  getCategoryEmoji(category) {
    const map = {
      '荤菜': '🍖',
      '素菜': '🥬',
      '汤品': '🍲',
      '主食': '🍚'
    };
    return map[category] || '🍽️';
  },

  /**
   * 获取菜品的展示图片（emoji）
   * 根据菜名哈希返回不同的食物emoji
   */
  getDishEmoji(name, index) {
    const emojis = [
      '🍖', '🍗', '🥩', '🍤', '🐟', '🦐', '🦀', '🥓',
      '🥬', '🥒', '🥦', '🍅', '🌽', '🥕', '🧅', '🍄',
      '🍲', '🥘', '🍜', '🍝', '🥗', '🫕',
      '🍚', '🍙', '🍛', '🍞', '🥟', '🥠', '🍠', '🥔'
    ];
    if (index !== undefined && index < emojis.length) {
      return emojis[index];
    }
    // 基于名称哈希
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    return emojis[Math.abs(hash) % emojis.length];
  },

  /**
   * 计算食材新鲜度状态
   * 返回: 'fresh' | 'warning' (3天内过期) | 'expired'
   */
  getFridgeStatus(expiryDateStr) {
    if (!expiryDateStr) return 'fresh';
    const now = new Date();
    const today = this.formatDate(now);
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'fresh';
  },

  /**
   * 显示 Toast 提示
   */
  showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.className = 'toast';
    }, 2000);
  }
};
