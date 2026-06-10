/* ============================================================
   应用主控 — SPA 路由、全局状态、页面协调
   ============================================================ */

const App = (function () {
  // ---- 全局状态 ----
  const state = {
    currentPage: 'home',
    previousPage: null,
    deviceId: null,
    nickname: null,
    familyId: null,
    familyName: null,
    shareCode: null,
    selectedDate: Utils.getToday(),
    // 首页状态
    homeCategory: '全部',
    searchKeyword: '',
    currentRecommend: null,
  };

  // ---- 页面映射 ----
  const pageMap = {
    home: 'page-home',
    menu: 'page-menu',
    'all-dishes': 'page-all-dishes',
    fridge: 'page-fridge',
    profile: 'page-profile'
  };

  // ---- 初始化 ----
  function init() {
    console.log('🐱 趣味点菜 PWA 启动中...');

    // 加载用户数据
    state.deviceId = Utils.getDeviceId();
    state.nickname = localStorage.getItem('nickname') || '';
    state.familyId = localStorage.getItem('familyId') || null;
    state.shareCode = localStorage.getItem('shareCode') || null;

    // 初始化数据库
    DB.init();

    // 设置昵称默认值
    if (!state.nickname) {
      state.nickname = '小猫咪' + Math.floor(Math.random() * 100);
      localStorage.setItem('nickname', state.nickname);
    }

    // 绑定事件
    bindNavigation();
    bindBackButtons();
    bindQuickEntries();

    // 初始化各页面
    if (typeof HomePage !== 'undefined') HomePage.init(state);
    if (typeof MenuPage !== 'undefined') MenuPage.init(state);
    if (typeof AllDishesPage !== 'undefined') AllDishesPage.init(state);
    if (typeof FridgePage !== 'undefined') FridgePage.init(state);
    if (typeof ProfilePage !== 'undefined') ProfilePage.init(state);

    // 默认显示首页
    navigateTo('home', false);

    console.log('✅ 应用启动完成');
    console.log(`  设备ID: ${state.deviceId}`);
    console.log(`  昵称: ${state.nickname}`);
    console.log(`  家庭组: ${state.familyId || '未加入'}`);
  }

  // ---- 导航 ----
  function navigateTo(page, addHistory = true) {
    const pageId = pageMap[page];
    if (!pageId) {
      console.warn('未知页面:', page);
      return;
    }

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.add('page-hidden'));

    // 显示目标页面
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.remove('page-hidden');
    }

    // 更新底部导航（含 aria-current）
    document.querySelectorAll('.nav-item').forEach(item => {
      const isActive = item.dataset.page === page;
      item.classList.toggle('active', isActive);
      if (isActive) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    // 更新状态
    state.previousPage = state.currentPage;
    state.currentPage = page;

    // 更新 URL hash
    if (addHistory) {
      window.location.hash = page;
    }

    // 页面显示后的回调
    onPageShown(page);

    // 滚动到顶部
    window.scrollTo(0, 0);
  }

  function onPageShown(page) {
    switch (page) {
      case 'home':
        if (typeof HomePage !== 'undefined') HomePage.onShow();
        break;
      case 'menu':
        if (typeof MenuPage !== 'undefined') MenuPage.onShow();
        break;
      case 'all-dishes':
        if (typeof AllDishesPage !== 'undefined') AllDishesPage.onShow();
        break;
      case 'fridge':
        if (typeof FridgePage !== 'undefined') FridgePage.onShow();
        break;
      case 'profile':
        if (typeof ProfilePage !== 'undefined') ProfilePage.onShow();
        break;
    }
  }

  function goBack() {
    if (state.previousPage) {
      navigateTo(state.previousPage, true);
    }
  }

  // ---- 事件绑定 ----

  function bindNavigation() {
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) navigateTo(page);
      });
    });

    // Hash 路由变化
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.replace('#', '') || 'home';
      if (pageMap[page] && page !== state.currentPage) {
        navigateTo(page, false);
      }
    });

    // 初始 hash
    const initialPage = window.location.hash.replace('#', '') || 'home';
    if (initialPage !== 'home' && pageMap[initialPage]) {
      navigateTo(initialPage, false);
    }
  }

  function bindBackButtons() {
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('home');
      });
    });
  }

  function bindQuickEntries() {
    document.querySelectorAll('.quick-card').forEach(card => {
      card.addEventListener('click', () => {
        const page = card.dataset.page;
        if (page) navigateTo(page);
      });
    });

    // 缺省状态中的跳转按钮
    document.querySelectorAll('[data-page]').forEach(el => {
      if (!el.closest('.nav-item') && !el.closest('.quick-card')) {
        el.addEventListener('click', () => {
          const page = el.dataset.page;
          if (page) navigateTo(page);
        });
      }
    });
  }

  // ---- 弹窗管理 ----
  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  }

  // 点击遮罩关闭
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('show');
    }
  });

  // ---- 状态更新 ----
  function updateState(key, value) {
    state[key] = value;
  }

  function getState(key) {
    return state[key];
  }

  // ---- 公开 API ----
  return {
    init,
    navigateTo,
    goBack,
    showModal,
    hideModal,
    updateState,
    getState,
    state
  };
})();

// ---- 启动应用 ----
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
