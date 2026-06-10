/* ============================================================
   数据层 — Supabase REST API + localStorage 降级
   直接使用 fetch() 调用 Supabase REST API，无需 SDK
   ============================================================ */

const DB = (function () {
  // ---- 配置 ----
  const SUPABASE_URL = 'https://ahsjypnnkljjubnsmbej.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3LVXR0WHSoeuO9klm2qMfQ_xR-wV7vq';

  let useCloud = false;

  // ---- REST API 辅助 ----
  async function api(method, table, options = {}) {
    const { body, params } = options;
    let url = `${SUPABASE_URL}/rest/v1/${table}`;

    // 查询参数（手动拼接，避免 URLSearchParams 编码 * 等特殊字符）
    if (params) {
      const parts = [];
      for (const [k, v] of Object.entries(params)) {
        parts.push(k + '=' + v);
      }
      url += '?' + parts.join('&');
    }

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
    if (method === 'POST' || method === 'PATCH') {
      headers['Prefer'] = 'return=representation';
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: err };
      }

      // DELETE 通常返回空
      if (method === 'DELETE' || res.status === 204) {
        return { data: null, error: null };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message || '网络请求失败' } };
    }
  }

  // ---- 初始化 ----
  async function init() {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const { data, error } = await api('GET', 'dishes', { params: { select: 'id', limit: '1' } });
      if (!error) {
        useCloud = true;
        console.log('✅ Supabase 云端已连接');

        // 验证本地家庭组是否在云端存在
        const localFamilyId = localStorage.getItem('familyId');
        if (localFamilyId) {
          const { data: families } = await api('GET', 'families', {
            params: { select: 'id', id: 'eq.' + localFamilyId }
          });
          if (!families || families.length === 0) {
            // 云端没有这个家庭组，使用本地模式
            useCloud = false;
            console.warn('⚠️ 家庭组未同步到云端，使用本地存储');
            return;
          }
        }
        return;
      }
      console.warn('⚠️ Supabase 连接失败，使用本地存储:', error.message);
    }
    useCloud = false;
    console.log('ℹ️ 本地存储模式');
  }

  // ---- 本地存储辅助 ----
  const LS = {
    get(key) {
      try { return JSON.parse(localStorage.getItem('cm_' + key)); } catch { return null; }
    },
    set(key, value) {
      localStorage.setItem('cm_' + key, JSON.stringify(value));
    }
  };

  // ================================================================
  //  家庭组操作
  // ================================================================

  async function createFamily(name) {
    const shareCode = Utils.generateShareCode();
    const familyId = 'fam_' + Date.now();

    if (useCloud) {
      const { data, error } = await api('POST', 'families', {
        body: { id: familyId, name, share_code: shareCode }
      });
      if (!error && data && data.length > 0) {
        await api('POST', 'family_members', {
          body: {
            id: 'mem_' + Date.now(),
            family_id: familyId,
            nickname: localStorage.getItem('nickname') || '家人',
            device_id: Utils.getDeviceId()
          }
        });
        localStorage.setItem('familyId', familyId);
        localStorage.setItem('shareCode', shareCode);
        return { data: data[0], error: null };
      }
      return { data: null, error };
    }

    // 本地模式
    const families = LS.get('families') || [];
    families.push({ id: familyId, name, share_code: shareCode, created_at: new Date().toISOString() });
    LS.set('families', families);

    const members = LS.get('family_members') || [];
    members.push({
      id: 'mem_' + Date.now(), family_id: familyId,
      nickname: localStorage.getItem('nickname') || '家人',
      device_id: Utils.getDeviceId(),
      created_at: new Date().toISOString()
    });
    LS.set('family_members', members);
    localStorage.setItem('familyId', familyId);
    localStorage.setItem('shareCode', shareCode);
    return { data: { id: familyId, name, share_code: shareCode }, error: null };
  }

  async function joinFamily(shareCode) {
    if (useCloud) {
      const { data: families, error } = await api('GET', 'families', {
        params: { select: '*', share_code: 'eq.' + shareCode }
      });
      if (error || !families || families.length === 0) {
        return { data: null, error: { message: '未找到该家庭组，请检查共享码' } };
      }
      const family = families[0];
      const deviceId = Utils.getDeviceId();
      // 检查是否已是成员，避免重复加入
      const { data: existing } = await api('GET', 'family_members', {
        params: { select: 'id', family_id: 'eq.' + family.id, device_id: 'eq.' + deviceId }
      });
      if (!existing || existing.length === 0) {
        const { error: joinErr } = await api('POST', 'family_members', {
          body: {
            id: 'mem_' + Date.now(),
            family_id: family.id,
            nickname: localStorage.getItem('nickname') || '家人',
            device_id: deviceId
          }
        });
        if (joinErr) return { data: family, error: joinErr };
      }
      localStorage.setItem('familyId', family.id);
      localStorage.setItem('shareCode', shareCode);
      return { data: family, error: null };
    }

    const families = LS.get('families') || [];
    const family = families.find(f => f.share_code === shareCode);
    if (!family) return { data: null, error: { message: '未找到该家庭组，请检查共享码' } };

    const members = LS.get('family_members') || [];
    const exists = members.find(m => m.family_id === family.id && m.device_id === Utils.getDeviceId());
    if (!exists) {
      members.push({
        id: 'mem_' + Date.now(), family_id: family.id,
        nickname: localStorage.getItem('nickname') || '家人',
        device_id: Utils.getDeviceId(),
        created_at: new Date().toISOString()
      });
      LS.set('family_members', members);
    }
    localStorage.setItem('familyId', family.id);
    localStorage.setItem('shareCode', shareCode);
    return { data: family, error: null };
  }

  async function leaveFamily() {
    const familyId = localStorage.getItem('familyId');
    if (useCloud) {
      const { error } = await api('DELETE', 'family_members', {
        params: { family_id: 'eq.' + familyId, device_id: 'eq.' + Utils.getDeviceId() }
      });
      if (!error) {
        localStorage.removeItem('familyId');
        localStorage.removeItem('shareCode');
      }
      return { error };
    }

    let members = LS.get('family_members') || [];
    members = members.filter(m => !(m.family_id === familyId && m.device_id === Utils.getDeviceId()));
    LS.set('family_members', members);
    localStorage.removeItem('familyId');
    localStorage.removeItem('shareCode');
    return { error: null };
  }

  async function deleteMember(memberId) {
    if (useCloud) {
      return await api('DELETE', 'family_members', { params: { id: 'eq.' + memberId } });
    }
    let members = LS.get('family_members') || [];
    members = members.filter(m => m.id !== memberId);
    LS.set('family_members', members);
    return { error: null };
  }

  async function getFamilyMembers(familyId) {
    if (useCloud) {
      return await api('GET', 'family_members', {
        params: { select: '*', family_id: 'eq.' + familyId, order: 'created_at.asc' }
      });
    }
    const members = LS.get('family_members') || [];
    return { data: members.filter(m => m.family_id === familyId), error: null };
  }

  // ================================================================
  //  菜品操作
  // ================================================================

  async function getDishes(familyId, category) {
    if (useCloud) {
      // 预设菜品(family_id.is.null) + 本家庭自定义菜品
      let filter = 'family_id.is.null';
      if (familyId) filter += `,family_id.eq.${familyId}`;
      const params = { select: '*', or: '(' + filter + ')' };
      if (category && category !== '全部') params.category = 'eq.' + category;
      params.order = 'created_at.asc';
      return await api('GET', 'dishes', { params });
    }

    let dishes = PresetDishes.getAll();
    const customDishes = LS.get('custom_dishes_' + (familyId || 'global')) || [];
    dishes = [...dishes, ...customDishes];
    if (category && category !== '全部') {
      dishes = dishes.filter(d => d.category === category);
    }
    return { data: dishes, error: null };
  }

  async function addCustomDish(familyId, dishData) {
    const dishId = 'dish_' + Date.now();
    if (useCloud) {
      return await api('POST', 'dishes', {
        body: {
          id: dishId, family_id: familyId, name: dishData.name,
          category: dishData.category, external_link: dishData.external_link || null,
          is_preset: false
        }
      });
    }

    const dishes = LS.get('custom_dishes_' + (familyId || 'global')) || [];
    const newDish = {
      id: dishId, family_id: familyId, name: dishData.name,
      category: dishData.category, external_link: dishData.external_link || null,
      is_preset: false, created_at: new Date().toISOString()
    };
    dishes.push(newDish);
    LS.set('custom_dishes_' + (familyId || 'global'), dishes);
    return { data: [newDish], error: null };
  }

  // ================================================================
  //  今日菜单操作
  // ================================================================

  async function getTodayMenu(familyId, date) {
    if (useCloud) {
      const result = await api('GET', 'today_menu', {
        params: {
          select: '*,dish:dishes(*)',
          family_id: 'eq.' + familyId,
          date: 'eq.' + date,
          order: 'created_at.asc'
        }
      });
      if (!result.error) return result;
      // 云端失败，降级到本地存储
      console.warn('云端获取菜单失败，降级到本地存储:', result.error.message);
    }

    const allMenu = LS.get('today_menu') || [];
    const menu = allMenu.filter(m => m.family_id === familyId && m.date === date);
    let allDishes = PresetDishes.getAll();
    const customDishes = LS.get('custom_dishes_' + familyId) || [];
    allDishes = [...allDishes, ...customDishes];
    const items = menu.map(m => {
      const dish = allDishes.find(d => d.id === m.dish_id);
      return { ...m, dish };
    }).filter(m => m.dish);
    return { data: items, error: null };
  }

  async function updateMenuNote(menuId, note) {
    if (useCloud) {
      return await api('PATCH', 'today_menu', {
        params: { id: 'eq.' + menuId },
        body: { note: note || null }
      });
    }

    const allMenu = LS.get('today_menu') || [];
    const idx = allMenu.findIndex(m => m.id === menuId);
    if (idx !== -1) {
      allMenu[idx].note = note || null;
      LS.set('today_menu', allMenu);
    }
    return { error: null };
  }

  // ---- 多留言功能 (menu_notes) ----
  async function getMenuNotes(menuId) {
    if (useCloud) {
      return await api('GET', 'menu_notes', {
        params: { menu_id: 'eq.' + menuId, order: 'created_at.asc' }
      });
    }
    // 本地存储降级
    const key = 'menu_notes_' + menuId;
    const notes = LS.get(key) || [];
    return { data: notes, error: null };
  }

  async function addMenuNote(menuId, familyId, nickname, content) {
    const noteId = 'note_' + Date.now();
    if (useCloud) {
      // 不传 id，让数据库自动生成 UUID
      const result = await api('POST', 'menu_notes', {
        body: { menu_id: menuId, family_id: familyId, nickname, content }
      });
      return result;
    }
    // 本地存储降级
    const key = 'menu_notes_' + menuId;
    const notes = LS.get(key) || [];
    notes.push({ id: noteId, menu_id: menuId, nickname, content, created_at: new Date().toISOString() });
    LS.set(key, notes);
    return { data: [{ id: noteId }], error: null };
  }

  async function deleteMenuNote(noteId) {
    if (useCloud) {
      return await api('DELETE', 'menu_notes', { params: { id: 'eq.' + noteId } });
    }
    // 本地存储降级 — 遍历所有 menu_notes_ key 查找并删除
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('menu_notes_')) {
        let notes = LS.get(key) || [];
        const filtered = notes.filter(n => n.id !== noteId);
        if (filtered.length !== notes.length) {
          LS.set(key, filtered);
          return { error: null };
        }
      }
    }
    return { error: null };
  }

  async function addToTodayMenu(familyId, dishId, date, addedBy, note) {
    const menuId = 'menu_' + Date.now();
    if (useCloud) {
      const body = { id: menuId, family_id: familyId, dish_id: dishId, date, added_by: addedBy };
      if (note) body.note = note;
      const result = await api('POST', 'today_menu', { body });
      if (!result.error) return result;
      // 云端失败，降级到本地存储
      console.warn('云端添加菜单失败，降级到本地存储:', result.error.message);
    }

    const allMenu = LS.get('today_menu') || [];
    const exists = allMenu.find(m => m.family_id === familyId && m.dish_id === dishId && m.date === date);
    if (exists) return { data: null, error: { message: '这道菜今天已经有了~' } };

    allMenu.push({ id: menuId, family_id: familyId, dish_id: dishId, date, added_by: addedBy, note: note || null, created_at: new Date().toISOString() });
    LS.set('today_menu', allMenu);
    return { data: [{ id: menuId }], error: null };
  }

  async function removeFromTodayMenu(menuId) {
    if (useCloud) {
      return await api('DELETE', 'today_menu', { params: { id: 'eq.' + menuId } });
    }
    let allMenu = LS.get('today_menu') || [];
    allMenu = allMenu.filter(m => m.id !== menuId);
    LS.set('today_menu', allMenu);
    return { error: null };
  }

  // ================================================================
  //  冰箱食材操作
  // ================================================================

  async function getFridgeItems(familyId) {
    if (useCloud) {
      return await api('GET', 'fridge_items', {
        params: { select: '*', family_id: 'eq.' + familyId, order: 'expiry_date.asc.nullsfirst' }
      });
    }
    const items = LS.get('fridge_' + familyId) || [];
    items.sort((a, b) => {
      if (!a.expiry_date) return -1;
      if (!b.expiry_date) return 1;
      return a.expiry_date.localeCompare(b.expiry_date);
    });
    return { data: items, error: null };
  }

  async function addFridgeItem(familyId, itemData) {
    const itemId = 'fridge_' + Date.now();
    if (useCloud) {
      return await api('POST', 'fridge_items', {
        body: {
          id: itemId, family_id: familyId, name: itemData.name,
          purchase_date: itemData.purchase_date || Utils.getToday(),
          expiry_date: itemData.expiry_date || null,
          added_by: itemData.added_by
        }
      });
    }

    const items = LS.get('fridge_' + familyId) || [];
    items.push({
      id: itemId, family_id: familyId, name: itemData.name,
      purchase_date: itemData.purchase_date || Utils.getToday(),
      expiry_date: itemData.expiry_date || null,
      added_by: itemData.added_by, created_at: new Date().toISOString()
    });
    LS.set('fridge_' + familyId, items);
    return { data: [{ id: itemId }], error: null };
  }

  async function removeFridgeItem(itemId, familyId) {
    if (useCloud) {
      return await api('DELETE', 'fridge_items', { params: { id: 'eq.' + itemId } });
    }
    let items = LS.get('fridge_' + familyId) || [];
    items = items.filter(i => i.id !== itemId);
    LS.set('fridge_' + familyId, items);
    return { error: null };
  }

  // ---- 公开 API ----
  return {
    init,
    isConnected: () => useCloud,
    createFamily,
    joinFamily,
    leaveFamily,
    getFamilyMembers,
    deleteMember,
    getDishes,
    addCustomDish,
    getTodayMenu,
    addToTodayMenu,
    updateMenuNote,
    getMenuNotes,
    addMenuNote,
    deleteMenuNote,
    removeFromTodayMenu,
    getFridgeItems,
    addFridgeItem,
    removeFridgeItem
  };
})();
