/* ============================================================
   菜品详情弹窗模块 — 支持查看/编辑外部链接
   ============================================================ */

const DishDetail = (function () {
  let currentDish = null;
  let appState = null;

  function init() {
    // 弹窗关闭
    document.getElementById('modal-dish-close').addEventListener('click', close);

    // 加入今日菜单按钮
    document.getElementById('btn-add-to-menu').addEventListener('click', () => {
      if (!currentDish) return;
      addToMenu();
    });

    // 编辑链接按钮
    document.getElementById('btn-edit-link').addEventListener('click', () => {
      showLinkEdit();
    });

    // 保存链接按钮
    document.getElementById('btn-save-link').addEventListener('click', () => {
      saveLink();
    });
  }

  function open(dish, state) {
    currentDish = dish;
    appState = state;

    document.getElementById('modal-dish-image').textContent = Utils.getDishEmoji(dish.name);
    document.getElementById('modal-dish-name').textContent = dish.name;

    const catEl = document.getElementById('modal-dish-category');
    catEl.textContent = dish.category;
    catEl.className = 'modal-dish-category ' + Utils.getCategoryClass(dish.category);

    // 外部链接区域
    renderLinkSection(dish);

    App.showModal('modal-dish-detail');
  }

  function renderLinkSection(dish) {
    const viewEl = document.getElementById('modal-dish-link-view');
    const editEl = document.getElementById('modal-dish-link-edit');
    const linkInput = document.getElementById('modal-dish-link-input');
    const linkEl = document.getElementById('modal-dish-link');

    if (dish.external_link) {
      // 有链接 → 显示链接 + 修改按钮
      viewEl.style.display = 'flex';
      editEl.style.display = 'none';
      linkEl.href = dish.external_link;
      linkEl.textContent = '📎 查看菜谱链接';
    } else {
      // 无链接 → 显示输入框
      viewEl.style.display = 'none';
      editEl.style.display = 'block';
      linkInput.value = '';
    }
  }

  function showLinkEdit() {
    const viewEl = document.getElementById('modal-dish-link-view');
    const editEl = document.getElementById('modal-dish-link-edit');
    const linkInput = document.getElementById('modal-dish-link-input');

    viewEl.style.display = 'none';
    editEl.style.display = 'block';
    linkInput.value = currentDish.external_link || '';
    linkInput.focus();
  }

  async function saveLink() {
    const newLink = document.getElementById('modal-dish-link-input').value.trim();

    if (!newLink) {
      Utils.showToast('请输入链接地址', 'error');
      return;
    }

    // 验证 URL 格式
    try {
      new URL(newLink);
    } catch {
      Utils.showToast('请输入有效的链接地址（以 http:// 或 https:// 开头）', 'error');
      return;
    }

    // 更新当前菜品对象
    currentDish.external_link = newLink;

    // 如果不是预设菜品，更新到数据库
    if (!currentDish.is_preset && appState.familyId) {
      // 使用 REST API 更新菜品链接
      try {
        await fetch(
          `https://ahsjypnnkljjubnsmbej.supabase.co/rest/v1/dishes?id=eq.${currentDish.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': 'sb_publishable_3LVXR0WHSoeuO9klm2qMfQ_xR-wV7vq',
              'Authorization': 'Bearer sb_publishable_3LVXR0WHSoeuO9klm2qMfQ_xR-wV7vq',
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ external_link: newLink })
          }
        );
      } catch (e) {
        // 网络错误，只更新本地显示
        console.warn('链接云端同步失败，仅本地生效', e);
      }
    }

    // 更新 UI
    const viewEl = document.getElementById('modal-dish-link-view');
    const editEl = document.getElementById('modal-dish-link-edit');
    const linkEl = document.getElementById('modal-dish-link');

    viewEl.style.display = 'flex';
    editEl.style.display = 'none';
    linkEl.href = newLink;
    linkEl.textContent = '📎 查看菜谱链接';

    Utils.showToast('链接已保存！🔗', 'success');

    // 刷新全部菜品列表（如果页面打开着）
    if (typeof AllDishesPage !== 'undefined' && App.state.currentPage === 'all-dishes') {
      const activeTag = document.querySelector('#category-scroll .category-tag-sm.active');
      AllDishesPage.renderDishGrid(activeTag ? activeTag.dataset.category : '全部');
    }
  }

  function close() {
    App.hideModal('modal-dish-detail');
    currentDish = null;
  }

  async function addToMenu() {
    if (!currentDish || !appState) return;

    const familyId = appState.familyId;
    if (!familyId) {
      Utils.showToast('请先在"我的"页面创建或加入家庭组~', 'error');
      return;
    }

    const date = Utils.getToday();
    const addedBy = appState.nickname || '家人';

    const { error } = await DB.addToTodayMenu(familyId, currentDish.id, date, addedBy);
    if (error) {
      Utils.showToast(error.message || '添加失败', 'error');
    } else {
      Utils.showToast(`「${currentDish.name}」已加入今日菜单！🎉`, 'success');
      close();
    }
  }

  // 初始化
  init();

  return { open, close };
})();
