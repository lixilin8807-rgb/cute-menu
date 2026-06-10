/* ============================================================
   我的页面模块
   ============================================================ */

const ProfilePage = (function () {
  let appState;

  function init(state) {
    appState = state;
    bindEvents();

    // 监听昵称修改
    document.getElementById('profile-nickname').addEventListener('click', () => {
      editNickname();
    });
  }

  function onShow() {
    updateProfileUI();
    loadFamilyInfo();
  }

  function updateProfileUI() {
    const nickname = appState.nickname || localStorage.getItem('nickname') || '小猫咪';
    document.getElementById('profile-nickname').textContent = nickname;
  }

  async function loadFamilyInfo() {
    const familyId = appState.familyId;
    const joinedEl = document.getElementById('family-joined');
    const notJoinedEl = document.getElementById('family-not-joined');

    if (familyId) {
      // 已加入家庭组
      joinedEl.style.display = 'block';
      notJoinedEl.style.display = 'none';

      // 加载成员
      const { data: members } = await DB.getFamilyMembers(familyId);
      const countEl = document.getElementById('family-member-count');
      const membersList = document.getElementById('family-members-list');

      if (members && members.length > 0) {
        countEl.textContent = `👥 共 ${members.length} 位家庭成员`;
        const catEmojis = ['🐱', '😺', '😸', '😻', '🐈', '😼'];
        const currentDeviceId = Utils.getDeviceId();
        membersList.innerHTML = members.map((m, i) =>
          `<div class="family-member-row">
            <span class="family-member-avatar">${catEmojis[i % catEmojis.length]}</span>
            <span class="family-member-name">${Utils.escapeHtml(m.nickname)}</span>
            <button class="member-delete-btn"
                    data-member-id="${m.id}"
                    title="移除成员"
                    style="${m.device_id === currentDeviceId ? '' : 'display:none'}">✕</button>
          </div>`
        ).join('');

        // 绑定删除按钮
        membersList.querySelectorAll('.member-delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const memberId = btn.dataset.memberId;
            if (!confirm('确定要移除这个成员吗？')) return;
            const { error } = await DB.deleteMember(memberId);
            if (error) {
              Utils.showToast('移除失败，请重试', 'error');
            } else {
              Utils.showToast('成员已移除', 'success');
              loadFamilyInfo();
            }
          });
        });
      } else {
        countEl.textContent = '';
        membersList.innerHTML = '';
      }

      // 显示共享码
      const shareCode = appState.shareCode || localStorage.getItem('shareCode') || '';
      document.getElementById('share-code').textContent = shareCode;
    } else {
      // 未加入
      joinedEl.style.display = 'none';
      notJoinedEl.style.display = 'flex';
    }
  }

  function bindEvents() {
    // 创建家庭组
    document.getElementById('btn-create-family').addEventListener('click', async () => {
      const name = prompt('请输入家庭组名称（如：幸福的一家）：');
      if (!name || !name.trim()) return;

      const { data: family, error } = await DB.createFamily(name.trim());
      if (error) {
        Utils.showToast('创建失败，请重试', 'error');
        return;
      }

      appState.familyId = family.id;
      appState.shareCode = family.share_code;
      Utils.showToast(`家庭组「${family.name}」创建成功！🎉`, 'success');
      loadFamilyInfo();
    });

    // 加入家庭组
    document.getElementById('btn-join-family').addEventListener('click', async () => {
      const code = document.getElementById('join-code-input').value.trim().toUpperCase();
      if (!code || code.length !== 6) {
        Utils.showToast('请输入6位共享码', 'error');
        return;
      }

      const { data: family, error } = await DB.joinFamily(code);
      if (error) {
        Utils.showToast(error.message || '加入失败', 'error');
        return;
      }

      appState.familyId = family.id;
      appState.shareCode = family.share_code;
      document.getElementById('join-code-input').value = '';
      Utils.showToast(`已加入家庭组「${family.name}」！🎉`, 'success');
      loadFamilyInfo();
    });

    // 退出家庭组
    document.getElementById('btn-leave-family').addEventListener('click', async () => {
      if (!confirm('确定要退出当前家庭组吗？退出后将无法查看家庭菜单和冰箱。')) return;

      const { error } = await DB.leaveFamily();
      if (!error) {
        appState.familyId = null;
        appState.shareCode = null;
        Utils.showToast('已退出家庭组', 'success');
        loadFamilyInfo();
      }
    });

    // 修改昵称
    document.getElementById('btn-edit-nickname').addEventListener('click', () => {
      editNickname();
    });

    // 清除缓存
    document.getElementById('btn-clear-cache').addEventListener('click', () => {
      if (!confirm('确定要清除缓存吗？这将重置所有本地数据。')) return;
      const nickname = localStorage.getItem('nickname');
      const deviceId = localStorage.getItem('deviceId');
      localStorage.clear();
      if (nickname) localStorage.setItem('nickname', nickname);
      if (deviceId) localStorage.setItem('deviceId', deviceId);
      Utils.showToast('缓存已清除', 'success');
    });

    // 关于
    document.getElementById('btn-about').addEventListener('click', () => {
      alert('🐱 家庭趣味点菜 v1.0\n\n一个可爱的家庭点菜小程序\n让每天吃饭不再纠结！\n\n技术：PWA + Supabase');
    });
  }

  function editNickname() {
    const currentName = appState.nickname || localStorage.getItem('nickname') || '';
    const newName = prompt('请输入新昵称：', currentName);
    if (!newName || !newName.trim()) return;

    appState.nickname = newName.trim();
    localStorage.setItem('nickname', newName.trim());
    updateProfileUI();
    Utils.showToast('昵称已更新~', 'success');
  }

  return { init, onShow, loadFamilyInfo };
})();
