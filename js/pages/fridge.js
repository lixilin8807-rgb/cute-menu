/* ============================================================
   冰箱管理页模块
   ============================================================ */

const FridgePage = (function () {
  let appState;

  function init(state) {
    appState = state;
    bindEvents();
  }

  function onShow() {
    loadFridgeItems();
  }

  function bindEvents() {
    // 添加食材
    document.getElementById('btn-add-fridge').addEventListener('click', () => {
      addFridgeItem();
    });
  }

  async function addFridgeItem() {
    const familyId = appState.familyId;
    if (!familyId) {
      Utils.showToast('请先在"我的"页面创建或加入家庭组~', 'error');
      return;
    }

    const name = document.getElementById('fridge-name').value.trim();
    if (!name) {
      Utils.showToast('请输入食材名称', 'error');
      return;
    }

    const purchaseDate = document.getElementById('fridge-purchase-date').value || Utils.getToday();
    const expiryDate = document.getElementById('fridge-expiry-date').value || null;
    const addedBy = appState.nickname || '家人';

    const { error } = await DB.addFridgeItem(familyId, {
      name,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      added_by: addedBy
    });

    if (error) {
      Utils.showToast('添加失败，请重试', 'error');
    } else {
      Utils.showToast(`「${name}」已添加到冰箱！🧊`, 'success');
      // 清空表单
      document.getElementById('fridge-name').value = '';
      document.getElementById('fridge-purchase-date').value = '';
      document.getElementById('fridge-expiry-date').value = '';
      // 刷新列表
      loadFridgeItems();
    }
  }

  async function loadFridgeItems() {
    const familyId = appState.familyId;
    const listEl = document.getElementById('fridge-list');
    const emptyEl = document.getElementById('fridge-empty');

    if (!familyId) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    const { data: items, error } = await DB.getFridgeItems(familyId);

    if (error || !items || items.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    emptyEl.classList.add('hidden');

    listEl.innerHTML = items.map((item, i) => {
      const status = Utils.getFridgeStatus(item.expiry_date);
      const statusClass = status === 'warning' ? 'warning' : (status === 'expired' ? 'expired' : '');
      const fridgeImg = Illustrations.getFridgeImage(item.name);

      let dateInfo = '';
      if (item.purchase_date) {
        dateInfo += `购买: ${item.purchase_date}`;
      }
      if (item.expiry_date) {
        dateInfo += ` | 保质期至: ${item.expiry_date}`;
        if (status === 'warning') dateInfo += ' ⚠️临近过期';
        if (status === 'expired') dateInfo += ' ❌已过期';
      }

      return `
        <div class="fridge-item ${statusClass}" data-item-id="${item.id}">
          <div class="fridge-item-icon">${Illustrations.imgTagSimple(fridgeImg, item.name)}</div>
          <div class="fridge-item-info">
            <div class="fridge-item-name">${item.name}</div>
            <div class="fridge-item-dates">${dateInfo || '未设置日期'}</div>
          </div>
          <button class="fridge-item-delete" data-delete-id="${item.id}">🗑️</button>
        </div>
      `;
    }).join('');

    // 绑定删除按钮
    listEl.querySelectorAll('.fridge-item-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.deleteId;
        if (confirm('确定要删除这个食材吗？')) {
          const { error } = await DB.removeFridgeItem(itemId, familyId);
          if (!error) {
            Utils.showToast('已删除', 'success');
            loadFridgeItems();
          }
        }
      });
    });
  }

  return { init, onShow, loadFridgeItems };
})();
