/* ============================================================
   全部菜品页模块
   ============================================================ */

const AllDishesPage = (function () {
  let appState;

  function init(state) {
    appState = state;
    bindEvents();
  }

  function onShow() {
    renderDishGrid('全部');
  }

  function bindEvents() {
    // 分类标签切换
    document.querySelectorAll('#category-scroll .category-tag-sm').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('#category-scroll .category-tag-sm').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        renderDishGrid(tag.dataset.category);
      });
    });

    // 悬浮按钮 - 打开添加菜品弹窗
    document.getElementById('fab-add-dish').addEventListener('click', () => {
      openAddDishModal();
    });

    // 弹窗关闭
    document.getElementById('modal-add-close').addEventListener('click', () => {
      App.hideModal('modal-add-dish');
    });

    // 保存菜品
    document.getElementById('btn-save-dish').addEventListener('click', () => {
      saveCustomDish();
    });

    // 添加菜品弹窗中的分类选择
    document.querySelectorAll('#add-dish-categories .category-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('#add-dish-categories .category-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });
  }

  async function renderDishGrid(category) {
    const grid = document.getElementById('dish-grid');
    const familyId = appState.familyId;

    // 获取菜品（预设 + 自定义）
    let dishes = PresetDishes.getByCategory(category);

    // 如果有家庭组，加载自定义菜品
    if (familyId) {
      const { data: customDishes } = await DB.getDishes(familyId, category);
      if (customDishes) {
        // 只取自定义的（非预设），预设已包含
        const customOnly = customDishes.filter(d => !d.is_preset);
        dishes = [...dishes, ...customOnly];
      }
    }

    if (dishes.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p class="empty-text">该分类下暂无菜品</p></div>';
      return;
    }

    grid.innerHTML = dishes.map((dish, i) => {
      const tagClass = Utils.getCategoryClass(dish.category);
      const emoji = Utils.getDishEmoji(dish.name, i);
      return `
        <div class="dish-card" data-dish-id="${dish.id}" data-dish-name="${dish.name}" data-dish-category="${dish.category}" data-dish-link="${dish.external_link || ''}">
          <div class="dish-card-image">${emoji}</div>
          <div class="dish-card-body">
            <div class="dish-card-name">${dish.name}</div>
            <div class="dish-card-footer">
              <span class="dish-card-tag ${tagClass}">${dish.category}</span>
              <span class="dish-card-fav">🤍</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 绑定卡片点击 → 打开详情弹窗
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

    // 绑定收藏按钮
    grid.querySelectorAll('.dish-card-fav').forEach(fav => {
      fav.addEventListener('click', (e) => {
        e.stopPropagation();
        fav.classList.toggle('liked');
        fav.textContent = fav.classList.contains('liked') ? '❤️' : '🤍';
      });
    });
  }

  function openAddDishModal() {
    // 重置表单
    document.getElementById('add-dish-name').value = '';
    document.getElementById('add-dish-link').value = '';
    document.querySelectorAll('#add-dish-categories .category-tag').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
    });
    App.showModal('modal-add-dish');
  }

  async function saveCustomDish() {
    const name = document.getElementById('add-dish-name').value.trim();
    if (!name) {
      Utils.showToast('请输入菜品名称', 'error');
      return;
    }

    // 获取选中的分类
    const activeTag = document.querySelector('#add-dish-categories .category-tag.active');
    const category = activeTag ? activeTag.dataset.category : '荤菜';

    const externalLink = document.getElementById('add-dish-link').value.trim() || null;
    const familyId = appState.familyId;

    const { error } = await DB.addCustomDish(familyId, { name, category, external_link });

    if (error) {
      Utils.showToast('添加失败，请重试', 'error');
    } else {
      Utils.showToast(`「${name}」添加成功！`, 'success');
      App.hideModal('modal-add-dish');
      // 刷新列表
      const currentCategory = document.querySelector('#category-scroll .category-tag-sm.active');
      renderDishGrid(currentCategory ? currentCategory.dataset.category : '全部');
    }
  }

  return { init, onShow, renderDishGrid };
})();
