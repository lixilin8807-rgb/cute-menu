/* ============================================================
   首页模块
   ============================================================ */

const HomePage = (function () {
  let appState;

  function init(state) {
    appState = state;
    bindEvents();
  }

  function onShow() {
    // 每次进入首页时刷新
    refreshRecommend();
  }

  function bindEvents() {
    // 今天吃什么按钮
    document.getElementById('btn-what-to-eat').addEventListener('click', () => {
      randomPick();
    });

    // 搜索框
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', Utils.debounce((e) => {
      appState.searchKeyword = e.target.value;
      updateRecommendBySearch();
    }, 300));

    // 分类标签
    document.querySelectorAll('#category-tabs .category-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('#category-tabs .category-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        appState.homeCategory = tag.dataset.category;
        refreshRecommend();
      });
    });

    // 换一个按钮
    document.getElementById('btn-refresh').addEventListener('click', () => {
      refreshRecommend();
      // 按钮动画
      animatePaw();
    });

    // 就它了
    document.getElementById('btn-confirm').addEventListener('click', () => {
      const dish = appState.currentRecommend;
      if (!dish) return;
      addToTodayMenu(dish);
    });
  }

  function randomPick() {
    const dishes = getFilteredDishes();
    if (dishes.length === 0) {
      Utils.showToast('没有找到菜品~', 'error');
      return;
    }
    const dish = Utils.randomPick(dishes);
    displayRecommend(dish);
    animatePaw();
  }

  function refreshRecommend() {
    const dishes = getFilteredDishes();
    if (dishes.length === 0) return;
    const dish = Utils.randomPick(dishes);
    displayRecommend(dish);
  }

  function updateRecommendBySearch() {
    const dishes = getFilteredDishes();
    if (dishes.length === 0) return;
    displayRecommend(dishes[0]); // 显示第一个匹配的
  }

  function getFilteredDishes() {
    let dishes = PresetDishes.getAll();
    // 分类筛选
    if (appState.homeCategory && appState.homeCategory !== '全部') {
      dishes = dishes.filter(d => d.category === appState.homeCategory);
    }
    // 搜索筛选
    if (appState.searchKeyword && appState.searchKeyword.trim()) {
      const kw = appState.searchKeyword.trim().toLowerCase();
      dishes = dishes.filter(d => d.name.toLowerCase().includes(kw));
    }
    return dishes;
  }

  function displayRecommend(dish) {
    if (!dish) return;
    appState.currentRecommend = dish;
    document.getElementById('recommend-image').textContent = Utils.getDishEmoji(dish.name);
    document.getElementById('recommend-name').textContent = dish.name;
    const catEl = document.getElementById('recommend-category');
    catEl.textContent = dish.category;
    catEl.className = 'recommend-category ' + Utils.getCategoryClass(dish.category);
  }

  function animatePaw() {
    const paw = document.querySelector('.btn-hero-paw');
    if (!paw) return;
    paw.style.animation = 'none';
    paw.offsetHeight; // reflow
    paw.style.animation = 'paw-bounce 0.6s ease-out';
  }

  async function addToTodayMenu(dish) {
    const familyId = appState.familyId;
    if (!familyId) {
      // 未加入家庭组，提示
      Utils.showToast('请先在"我的"页面创建或加入家庭组~', 'error');
      return;
    }

    const date = appState.selectedDate || Utils.getToday();
    const addedBy = appState.nickname || '家人';

    const { error } = await DB.addToTodayMenu(familyId, dish.id, date, addedBy);
    if (error) {
      Utils.showToast(error.message || '添加失败，请重试', 'error');
    } else {
      Utils.showToast(`「${dish.name}」已加入今日菜单！🎉`, 'success');
    }
  }

  return { init, onShow };
})();
