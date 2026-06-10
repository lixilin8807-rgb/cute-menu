/* ============================================================
   今日菜单页模块
   ============================================================ */

const MenuPage = (function () {
  let appState;
  let longPressTimer = null;
  let deletingItemId = null;
  let activeEditorId = null;   // 当前展开的留言编辑器 menuId

  function init(state) {
    appState = state;
    bindEvents();
  }

  function onShow() {
    // 默认显示今天的菜单
    appState.selectedDate = Utils.getToday();
    updateDateDisplay();
    loadMenu();
  }

  function bindEvents() {
    // 日期切换
    document.getElementById('date-prev').addEventListener('click', () => {
      appState.selectedDate = Utils.addDays(appState.selectedDate, -1);
      updateDateDisplay();
      loadMenu();
    });

    document.getElementById('date-next').addEventListener('click', () => {
      const tomorrow = Utils.addDays(Utils.getToday(), 1);
      if (appState.selectedDate < tomorrow) {
        appState.selectedDate = Utils.addDays(appState.selectedDate, 1);
        updateDateDisplay();
        loadMenu();
      }
    });

    // 点击日期显示回到今天
    document.getElementById('date-display').addEventListener('click', () => {
      appState.selectedDate = Utils.getToday();
      updateDateDisplay();
      loadMenu();
    });
  }

  function updateDateDisplay() {
    document.getElementById('date-display').textContent =
      Utils.formatDateCN(appState.selectedDate);
  }

  async function loadMenu() {
    const familyId = appState.familyId;
    const menuList = document.getElementById('menu-list');
    const emptyState = document.getElementById('menu-empty');

    if (!familyId) {
      menuList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    const { data: items, error } = await DB.getTodayMenu(familyId, appState.selectedDate);

    if (error || !items || items.length === 0) {
      menuList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    activeEditorId = null;

    // 并行加载所有菜品的留言
    const notesPromises = items.map(item => DB.getMenuNotes(item.id).then(r => r.data || []));
    const allNotes = await Promise.all(notesPromises);

    menuList.innerHTML = items.map((item, i) => {
      const dish = item.dish || {};
      const tagClass = Utils.getCategoryClass(dish.category || '');
      const dishImg = Illustrations.getDishImage(dish.name || '', dish.category || '');
      const dishId = dish.id || '';
      const dishCategory = dish.category || '';
      const dishLink = dish.external_link || '';
      const notes = allNotes[i] || [];
      const noteCount = notes.length;
      return `
        <div class="menu-item"
             data-menu-id="${item.id}"
             data-dish-id="${dishId}"
             data-dish-name="${dish.name || ''}"
             data-dish-category="${dishCategory}"
             data-dish-link="${dishLink}">
          <div class="menu-item-row">
            <div class="menu-item-image">${Illustrations.imgTag(dishImg, dish.name || '食物')}</div>
            <div class="menu-item-info">
              <div class="menu-item-name">${dish.name || '未知菜品'}</div>
              <div class="menu-item-added-by">${item.added_by || '家人'} 添加 · 点击查看详情</div>
            </div>
            <button class="menu-item-note-toggle${noteCount > 0 ? ' has-note' : ''}"
                    data-menu-id="${item.id}"
                    data-action="toggle-note">
              <span class="menu-item-note-toggle-icon">💬</span>
              ${noteCount > 0 ? `<span class="menu-item-note-count">${noteCount}</span>` : ''}
            </button>
            <span class="menu-item-category ${tagClass}">${dish.category || ''}</span>
          </div>
          <div class="note-section hidden" data-menu-id="${item.id}">
            <div class="note-list" data-menu-id="${item.id}">
              ${notes.length === 0 ? '<div class="note-empty">暂无留言，来说点什么吧~</div>' : ''}
              ${notes.map(n => `
                <div class="note-bubble" data-note-id="${n.id}">
                  <span class="note-bubble-nickname">${Utils.escapeHtml(n.nickname || '家人')}</span>
                  <span class="note-bubble-content">${Utils.escapeHtml(n.content)}</span>
                  ${(n.nickname === appState.nickname || n.nickname === '家人') ? `<button class="note-bubble-delete" data-delete-note="${n.id}" title="删除">✕</button>` : ''}
                </div>
              `).join('')}
            </div>
            <div class="note-editor" data-menu-id="${item.id}">
              <input type="text" class="note-editor-input"
                     placeholder="添加留言..."
                     maxlength="100">
              <button class="btn-note-send" data-action="save-note">发送</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 绑定点击查看详情 + 长按删除 + 留言操作
    bindMenuItemInteractions();
  }

  function bindMenuItemInteractions() {
    const items = document.querySelectorAll('.menu-item');
    let isLongPress = false;
    let pressStartX = 0, pressStartY = 0;

    items.forEach(item => {
      // 点击 → 打开详情弹窗（排除留言相关按钮）
      item.addEventListener('click', (e) => {
        if (isLongPress) return;

        // 如果点击的是留言相关元素，不打开详情
        const target = e.target;
        if (target.closest('[data-action]')) return;
        if (target.closest('.note-editor')) return;
        if (target.closest('.note-section')) return;
        if (target.closest('.note-bubble')) return;
        if (target.closest('.menu-item-note-toggle')) return;

        const dishData = {
          id: item.dataset.dishId,
          name: item.dataset.dishName,
          category: item.dataset.dishCategory,
          external_link: item.dataset.dishLink || null
        };
        if (typeof DishDetail !== 'undefined') {
          DishDetail.open(dishData, appState);
        }
      });

      // 触摸长按 → 删除
      item.addEventListener('touchstart', (e) => {
        isLongPress = false;
        pressStartX = e.touches[0].clientX;
        pressStartY = e.touches[0].clientY;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          deletingItemId = item.dataset.menuId;
          item.classList.add('deleting');
          vibrate(20);
          showDeleteConfirm(item);
        }, 800);
      }, { passive: true });

      item.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
        setTimeout(() => { isLongPress = false; }, 100);
      });
      item.addEventListener('touchmove', (e) => {
        const dx = e.touches[0].clientX - pressStartX;
        const dy = e.touches[0].clientY - pressStartY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(longPressTimer);
        }
      });
      item.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer);
        setTimeout(() => { isLongPress = false; }, 100);
      });

      // 鼠标事件（PC调试）
      item.addEventListener('mousedown', () => {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          deletingItemId = item.dataset.menuId;
          item.classList.add('deleting');
          showDeleteConfirm(item);
        }, 800);
      });
      item.addEventListener('mouseup', () => {
        clearTimeout(longPressTimer);
        setTimeout(() => { isLongPress = false; }, 100);
      });
      item.addEventListener('mouseleave', () => {
        clearTimeout(longPressTimer);
      });
    });

    // ---- 留言功能事件绑定 ----

    // 点击留言按钮 → 展开/收起留言区
    document.querySelectorAll('[data-action="toggle-note"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = btn.dataset.menuId;
        toggleNoteSection(menuId);
      });
    });

    // 发送按钮
    document.querySelectorAll('[data-action="save-note"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = btn.closest('.note-section');
        if (!section) return;
        const menuId = section.dataset.menuId;
        saveNote(menuId);
      });
    });

    // 删除留言按钮
    document.querySelectorAll('[data-delete-note]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const noteId = btn.dataset.deleteNote;
        const section = btn.closest('.note-section');
        const menuId = section ? section.dataset.menuId : null;
        deleteNote(noteId, menuId);
      });
    });

    // 编辑器内输入框回车发送
    document.querySelectorAll('.note-editor-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const section = input.closest('.note-section');
          if (!section) return;
          const menuId = section.dataset.menuId;
          saveNote(menuId);
        }
      });

      // 点击输入框不冒泡
      input.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  }

  // ---- 留言操作 ----

  function toggleNoteSection(menuId) {
    const item = document.querySelector(`.menu-item[data-menu-id="${menuId}"]`);
    if (!item) return;

    const section = item.querySelector('.note-section');
    if (!section) return;

    const isHidden = section.classList.contains('hidden');

    // 关闭其他已展开的留言区
    if (activeEditorId && activeEditorId !== menuId) {
      const prevItem = document.querySelector(`.menu-item[data-menu-id="${activeEditorId}"]`);
      if (prevItem) {
        const prevSection = prevItem.querySelector('.note-section');
        if (prevSection) prevSection.classList.add('hidden');
      }
    }

    if (isHidden) {
      section.classList.remove('hidden');
      activeEditorId = menuId;
      const input = section.querySelector('.note-editor-input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    } else {
      section.classList.add('hidden');
      activeEditorId = null;
    }
  }

  async function saveNote(menuId) {
    const item = document.querySelector(`.menu-item[data-menu-id="${menuId}"]`);
    if (!item) return;

    const section = item.querySelector('.note-section');
    const input = section.querySelector('.note-editor-input');
    const content = input.value.trim();
    if (!content) {
      Utils.showToast('请输入留言内容', 'error');
      return;
    }

    const nickname = appState.nickname || '家人';
    const familyId = appState.familyId;

    const { error } = await DB.addMenuNote(menuId, familyId, nickname, content);

    if (error) {
      Utils.showToast('发送失败，请重试', 'error');
      return;
    }

    // 清空输入框
    input.value = '';

    // 刷新当前菜单项的留言列表
    await loadMenu();

    // 恢复留言区展开状态
    setTimeout(() => {
      const newItem = document.querySelector(`.menu-item[data-menu-id="${menuId}"]`);
      if (newItem) {
        const newSection = newItem.querySelector('.note-section');
        if (newSection) {
          newSection.classList.remove('hidden');
          activeEditorId = menuId;
        }
      }
    }, 100);

    Utils.showToast('留言已发送', 'success');
  }

  async function deleteNote(noteId, menuId) {
    if (!confirm('确定要删除这条留言吗？')) return;

    const { error } = await DB.deleteMenuNote(noteId);

    if (error) {
      Utils.showToast('删除失败，请重试', 'error');
      return;
    }

    Utils.showToast('留言已删除', 'success');
    await loadMenu();

    // 恢复留言区展开状态
    if (menuId) {
      setTimeout(() => {
        const item = document.querySelector(`.menu-item[data-menu-id="${menuId}"]`);
        if (item) {
          const section = item.querySelector('.note-section');
          if (section) {
            section.classList.remove('hidden');
            activeEditorId = menuId;
          }
        }
      }, 100);
    }
  }

  function showDeleteConfirm(item) {
    const dishName = item.dataset.dishName || '这道菜';
    if (confirm(`确定要删除「${dishName}」吗？`)) {
      deleteMenuItem();
    } else {
      item.classList.remove('deleting');
    }
    deletingItemId = null;
  }

  async function deleteMenuItem() {
    if (!deletingItemId) return;

    const { error } = await DB.removeFromTodayMenu(deletingItemId);
    if (error) {
      Utils.showToast('删除失败，请重试', 'error');
    } else {
      Utils.showToast('已删除', 'success');
      loadMenu();
    }
    deletingItemId = null;
  }

  function vibrate(duration) {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  return { init, onShow, loadMenu };
})();
