/* ============================================================
   首页模块 — 双功能：随机推荐 + 搜索点菜
   ============================================================ */

const HomePage = (function () {
  let appState;

  // 功能二局部状态
  let recentDishes = [];
  let searchTimer = null;
  let _searchAllDishes = [];     // 搜索区全部菜品缓存
  let _searchVisibleCount = 0;   // 当前可见数量
  const SEARCH_PAGE_SIZE = 12;   // 每次加载数量

  /* ============================================================
     初始化 & 事件绑定
     ============================================================ */

  function init(state) {
    appState = state;
    bindEvents();
    loadRecentDishes();
  }

  function onShow() {
    // 默认显示「给我灵感」模式
    switchMode('random');
    // 刷新最近点过的菜（功能二可能需要）
    renderRecentChips();
  }

  function bindEvents() {
    // ---- 功能一：随机推荐 ----
    // 随机推荐按钮
    document.getElementById('btn-what-to-eat').addEventListener('click', () => {
      randomPick();
    });

    // 分类标签（仅影响功能一）
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
      animatePaw();
    });

    // 就它了按钮
    document.getElementById('btn-confirm').addEventListener('click', () => {
      const dish = appState.currentRecommend;
      if (!dish) return;
      _addToMenu(dish);
    });

    // ---- 模式切换 ----
    document.querySelectorAll('#mode-toggle .mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
      });
    });

    // ---- 功能二：搜索 ----
    // 搜索输入框（防抖 300ms）
    const searchInput = document.getElementById('search-input-2');
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const keyword = searchInput.value.trim();
      if (!keyword) {
        hideSearchResults();
        showSearchDishGrid();
        return;
      }
      searchTimer = setTimeout(() => handleSearch(keyword), 300);
    });

    // 搜索区分类导航
    document.querySelectorAll('#search-category-scroll .category-tag-sm').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('#search-category-scroll .category-tag-sm').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        renderSearchDishGrid(tag.dataset.category);
      });
    });

    // 添加新菜品按钮（无结果时）
    document.getElementById('btn-add-new-dish').addEventListener('click', () => {
      openAddDishFromSearch();
    });
  }

  /* ============================================================
     模式切换
     ============================================================ */

  function switchMode(mode) {
    // 更新按钮 active 状态
    document.querySelectorAll('#mode-toggle .mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    const randomSection = document.getElementById('section-random');
    const searchSection = document.getElementById('section-search');

    if (mode === 'random') {
      searchSection.style.display = 'none';
      randomSection.style.display = '';
      // 切回时刷新随机推荐
      refreshRecommend();
    } else {
      randomSection.style.display = 'none';
      searchSection.style.display = '';
      // 切换时重置搜索分类导航为「全部」
      document.querySelectorAll('#search-category-scroll .category-tag-sm').forEach(t => {
        t.classList.toggle('active', t.dataset.category === '全部');
      });
      // 清空搜索框
      const searchInput = document.getElementById('search-input-2');
      if (searchInput) searchInput.value = '';
      // 切换到搜索模式时，渲染全部菜品
      hideSearchResults();
      showSearchDishGrid();
      renderSearchDishGrid('全部');
    }
  }

  /* ============================================================
     功能一：随机推荐
     ============================================================ */

  function randomPick() {
    const dishes = getFilteredDishes();
    if (dishes.length === 0) {
      Utils.showToast('该分类下暂无菜品~', 'error');
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

  /**
   * 获取筛选后的菜品 — 仅按分类筛选（不受搜索词影响）
   */
  function getFilteredDishes() {
    let dishes = PresetDishes.getAll();
    if (appState.homeCategory && appState.homeCategory !== '全部') {
      dishes = dishes.filter(d => d.category === appState.homeCategory);
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
    const pawImg = document.querySelector('.btn-hero-paw img');
    if (!pawImg) return;
    pawImg.style.animation = 'none';
    pawImg.offsetHeight; // reflow
    pawImg.style.animation = 'paw-bounce 0.6s ease-out';
  }

  /**
   * 统一的加入今日菜单逻辑（功能一 & 功能二共用）
   */
  async function _addToMenu(dish) {
    const familyId = appState.familyId;
    if (!familyId) {
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
      saveRecentDish(dish);
    }
  }

  /* ============================================================
     功能二：搜索 + 最近点过的菜
     ============================================================ */

  /**
   * 搜索菜品（预设 + 自定义）
   */
  async function handleSearch(keyword) {
    const kw = keyword.toLowerCase();

    // 搜索预设菜品
    let dishes = PresetDishes.search(kw);

    // 搜索自定义菜品（如果有家庭组）
    if (appState.familyId) {
      try {
        const { data: customDishes } = await DB.getDishes(appState.familyId);
        if (customDishes && customDishes.length > 0) {
          // 只取自定义的非预设菜品
          const customOnly = customDishes.filter(d => !d.is_preset);
          const matchedCustom = customOnly.filter(d =>
            d.name.toLowerCase().includes(kw)
          );
          dishes = [...dishes, ...matchedCustom];
        }
      } catch (e) {
        // 网络错误时静默处理，仅搜索预设菜品
        console.warn('搜索自定义菜品失败，仅搜索预设菜品', e);
      }
    }

    // 搜索时隐藏菜品网格和最近菜品
    hideSearchDishGrid();
    document.getElementById('recent-section').style.display = 'none';

    if (dishes.length > 0) {
      showSearchResults(dishes);
    } else {
      showNoResult(keyword);
    }
  }

  function showSearchResults(dishes) {
    const container = document.getElementById('search-results');
    const noResult = document.getElementById('search-no-result');

    noResult.style.display = 'none';
    container.style.display = 'block';

    container.innerHTML = dishes.map(dish => {
      const emoji = Utils.getDishEmoji(dish.name);
      const tagClass = Utils.getCategoryClass(dish.category);
      return `
        <div class="search-result-item">
          <span class="search-result-emoji">${emoji}</span>
          <div class="search-result-info">
            <div class="search-result-name">${Utils.escapeHtml(dish.name)}</div>
            <span class="search-result-category ${tagClass}">${dish.category}</span>
          </div>
          <button class="search-result-add" data-dish-id="${dish.id}" data-dish-name="${Utils.escapeHtml(dish.name)}" data-dish-category="${dish.category}">
            📋 加入
          </button>
        </div>
      `;
    }).join('');

    // 绑定「加入菜单」按钮
    container.querySelectorAll('.search-result-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dish = {
          id: btn.dataset.dishId,
          name: btn.dataset.dishName,
          category: btn.dataset.dishCategory
        };
        _addToMenu(dish);
      });
    });

    // 绑定整行点击 → 打开菜品详情
    container.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const addBtn = item.querySelector('.search-result-add');
        if (typeof DishDetail !== 'undefined') {
          DishDetail.open({
            id: addBtn.dataset.dishId,
            name: addBtn.dataset.dishName,
            category: addBtn.dataset.dishCategory,
            external_link: null
          }, appState);
        }
      });
    });
  }

  function showNoResult(keyword) {
    const container = document.getElementById('search-results');
    const noResult = document.getElementById('search-no-result');

    container.style.display = 'none';
    noResult.style.display = 'flex';
    document.getElementById('no-result-name').textContent = keyword;
  }

  function hideSearchResults() {
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-no-result').style.display = 'none';
    document.getElementById('search-results').innerHTML = '';
    // 恢复菜品网格和最近菜品
    showSearchDishGrid();
    renderRecentChips();
  }

  function showSearchDishGrid() {
    document.getElementById('search-dish-grid').style.display = '';
    document.getElementById('recent-section').style.display = recentDishes.length > 0 ? 'block' : 'none';
  }

  function hideSearchDishGrid() {
    document.getElementById('search-dish-grid').style.display = 'none';
  }

  /**
   * 渲染搜索区菜品网格 — 分页加载（初始 12 道，点击"加载更多"展开）
   */
  async function renderSearchDishGrid(category) {
    const grid = document.getElementById('search-dish-grid');
    const familyId = appState.familyId;

    // 获取预设菜品
    let dishes = PresetDishes.getByCategory(category);

    // 加载自定义菜品（如果有家庭组）
    if (familyId) {
      try {
        const { data: customDishes } = await DB.getDishes(familyId, category);
        if (customDishes) {
          const customOnly = customDishes.filter(d => !d.is_preset);
          dishes = [...dishes, ...customOnly];
        }
      } catch (e) {
        // 网络错误，仅展示预设菜品
      }
    }

    if (dishes.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p class="empty-text">该分类下暂无菜品</p></div>';
      _searchAllDishes = [];
      _searchVisibleCount = 0;
      return;
    }

    // 缓存全部菜品，初始化可见数量
    _searchAllDishes = dishes;
    _searchVisibleCount = Math.min(SEARCH_PAGE_SIZE, dishes.length);

    // 渲染当前批次
    _renderSearchDishBatch(grid);

    // 绑定网格容器的事件委托（点击卡片 + 加载更多）
    _bindSearchGridEvents(grid);

    // 如果还有更多，追加"加载更多"按钮
    _appendLoadMoreBtn(grid);
  }

  /** 渲染当前可见批次的菜品卡片 */
  function _renderSearchDishBatch(grid) {
    const visible = _searchAllDishes.slice(0, _searchVisibleCount);
    // 移除旧的"加载更多"按钮（如果有）
    const oldBtn = grid.querySelector('.load-more-wrapper');
    if (oldBtn) oldBtn.remove();

    grid.innerHTML = visible.map((dish, i) => {
      const tagClass = Utils.getCategoryClass(dish.category);
      const emoji = Utils.getDishEmoji(dish.name, i);
      return `
        <div class="dish-card" data-dish-id="${dish.id}" data-dish-name="${Utils.escapeHtml(dish.name)}" data-dish-category="${dish.category}" data-dish-link="${dish.external_link || ''}">
          <div class="dish-card-image">${emoji}</div>
          <div class="dish-card-body">
            <div class="dish-card-name">${Utils.escapeHtml(dish.name)}</div>
            <div class="dish-card-footer">
              <span class="dish-card-tag ${tagClass}">${dish.category}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /** 追加"加载更多"按钮 */
  function _appendLoadMoreBtn(grid) {
    if (_searchVisibleCount >= _searchAllDishes.length) return; // 已全部加载
    const wrapper = document.createElement('div');
    wrapper.className = 'load-more-wrapper';
    wrapper.innerHTML = `<button class="btn-load-more">查看更多（已显示 ${_searchVisibleCount}/${_searchAllDishes.length}）</button>`;
    grid.appendChild(wrapper);

    wrapper.querySelector('.btn-load-more').addEventListener('click', () => {
      _searchVisibleCount = Math.min(_searchVisibleCount + SEARCH_PAGE_SIZE, _searchAllDishes.length);
      _renderSearchDishBatch(grid);
      _bindSearchGridEvents(grid);
      _appendLoadMoreBtn(grid);
    });
  }

  /** 事件委托：绑定卡片点击 + 加载更多 */
  function _bindSearchGridEvents(grid) {
    grid.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        if (typeof DishDetail !== 'undefined') {
          DishDetail.open({
            id: card.dataset.dishId,
            name: card.dataset.dishName,
            category: card.dataset.dishCategory,
            external_link: card.dataset.dishLink || null
          }, appState);
        }
      });
    });
  }


  /* ============================================================
     最近点过的菜（localStorage）
     ============================================================ */

  function loadRecentDishes() {
    try {
      const stored = localStorage.getItem('cm_recent_dishes');
      recentDishes = stored ? JSON.parse(stored) : [];
    } catch (e) {
      recentDishes = [];
    }
  }

  function saveRecentDish(dish) {
    // 去重：如果已存在，先移除
    recentDishes = recentDishes.filter(d => d.id !== dish.id);
    // 添加到最前面
    recentDishes.unshift({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      timestamp: Date.now()
    });
    // 最多保留 8 条
    if (recentDishes.length > 8) {
      recentDishes = recentDishes.slice(0, 8);
    }
    // 持久化
    localStorage.setItem('cm_recent_dishes', JSON.stringify(recentDishes));
    // 刷新显示
    renderRecentChips();
  }

  function renderRecentChips() {
    const section = document.getElementById('recent-section');
    const chips = document.getElementById('recent-chips');

    if (recentDishes.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    chips.innerHTML = recentDishes.map(dish => {
      const emoji = Utils.getDishEmoji(dish.name);
      const tagClass = Utils.getCategoryClass(dish.category);
      return `
        <button class="recent-chip" data-dish-id="${dish.id}" data-dish-name="${Utils.escapeHtml(dish.name)}" data-dish-category="${dish.category}">
          <span class="recent-chip-emoji">${emoji}</span>
          <span>${Utils.escapeHtml(dish.name)}</span>
          <span class="recent-chip-category ${tagClass}">${dish.category}</span>
        </button>
      `;
    }).join('');

    // 绑定点击事件
    chips.querySelectorAll('.recent-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const dish = {
          id: chip.dataset.dishId,
          name: chip.dataset.dishName,
          category: chip.dataset.dishCategory
        };
        _addToMenu(dish);
      });
    });
  }


  /* ============================================================
     添加新菜品（复用弹窗）
     ============================================================ */

  function openAddDishFromSearch() {
    // 使用全部菜品页的添加弹窗
    const searchKeyword = document.getElementById('search-input-2').value.trim();

    // 重置表单
    document.getElementById('add-dish-name').value = searchKeyword;
    document.getElementById('add-dish-link').value = '';
    document.querySelectorAll('#add-dish-categories .category-tag').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
    });

    App.showModal('modal-add-dish');

    // 保存成功后需要刷新首页的搜索
    const saveBtn = document.getElementById('btn-save-dish');
    const onSaveSuccess = async () => {
      // 延迟等待保存完成，然后重新搜索
      setTimeout(() => {
        if (!document.getElementById('modal-add-dish').classList.contains('show')) {
          // 弹窗已关闭（保存成功），重新搜索
          const kw = document.getElementById('search-input-2').value.trim();
          if (kw) handleSearch(kw);
        }
      }, 500);
    };
    saveBtn.addEventListener('click', onSaveSuccess, { once: true });
  }

  /* ============================================================
     公开 API
     ============================================================ */

  return { init, onShow };
})();
