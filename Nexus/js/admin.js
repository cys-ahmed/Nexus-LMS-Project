(function () {
  if (!isLoggedIn()) { location.href = '../login.html'; return; }
  const u = getCurrentUser();
  if ((u?.role || '').toLowerCase() !== 'admin') location.href = '../user/dashboard.html';
})();
const me = getCurrentUser();
let users = [], adminCourses = [], announcements = [];
let userToDelete = null;
setText('sidebar-user', me?.username || 'Admin');
function openModal(id) { $id(id)?.classList.add('open'); }
function closeModal(id) { $id(id)?.classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); }));
function fillProfile() {
  if (!me) return;
  setText('profile-name', me.username || 'Admin');
  setText('profile-role', me.role || 'Admin');
  setText('profile-email', me.email || 'admin@nexus.io');
  setText('profile-id', 'ADM-001');
  setText('profile-login', formatDate(new Date().toISOString()));
}
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $id('tab-' + b.dataset.tab)?.classList.add('active');
});
$id('logout-btn').onclick = logout;
function updateOverview() {
  setText('stat-users', users.length);
  setText('stat-courses', adminCourses.length);
  setText('stat-announcements', announcements.length);
}
async function loadUsers() {
  const r = await apiFetch('/users');
  if (r.ok) {
    users = r.data;
    renderUsers();
    updateOverview();
  }
}
function renderUsers() {
  const el = $id('users-list');
  if (!el) return;
  if (users.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h3>No users found</h3><p>Add a user to get started</p></div>`;
    return;
  }
  el.innerHTML = users.map(u => `
    <div class="user-row">
      <div class="flex items-center gap-4">
        <div class="avatar">${escHtml((u.username || 'U').slice(0, 2).toUpperCase())}</div>
        <div>
          <p class="text-sm font-medium">${escHtml(u.username)}</p>
          <p class="text-xs text-muted">${escHtml(u.email)} · ${escHtml(u.role)}</p>
        </div>
      </div>
      <button class="btn btn-ghost btn-icon del-user-btn" data-id="${u.user_id}" ${u.user_id === me?.id ? 'disabled' : ''}
        style="color:var(--destructive)" title="Delete user">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
      </button>
    </div>`).join('');
  el.querySelectorAll('.del-user-btn').forEach(btn => {
    btn.onclick = () => { userToDelete = Number(btn.dataset.id); openModal('delete-user-modal'); };
  });
}
$id('open-add-user-btn').onclick = () => openModal('add-user-modal');
$id('cancel-add-user').onclick  = () => closeModal('add-user-modal');
$id('cancel-del-user').onclick  = () => { userToDelete = null; closeModal('delete-user-modal'); };
$id('save-user-btn').onclick = async () => {
  const name  = $id('new-username').value.trim();
  const email = $id('new-email').value.trim();
  const role  = $id('new-role').value;
  if (!name || !email) { toast({ title: 'Validation Error', desc: 'Username and email are required.', err: true }); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast({ title: 'Invalid email', err: true }); return; }
  const pw = Math.random().toString(36).slice(2, 10);
  const r  = await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: name, email, password: pw, role }) });
  if (r.ok && r.data.success) {
    await loadUsers();
    closeModal('add-user-modal');
    $id('new-username').value = $id('new-email').value = '';
    toast({ title: 'User Added', desc: `${name} · temp password: ${pw}` });
  } else {
    toast({ title: 'Error', desc: r.data.error || 'Failed to add user', err: true });
  }
};
$id('confirm-del-user').onclick = async () => {
  const r = await apiFetch(`/users/${userToDelete}`, { method: 'DELETE' });
  if (r.ok) {
    await loadUsers();
    closeModal('delete-user-modal');
    userToDelete = null;
    toast({ title: 'User Deleted' });
  } else {
    toast({ title: 'Error', desc: r.data.error || 'Failed to delete user', err: true });
  }
};
const EMOJI_MAP = {
  'Web Development': '💻', 'Data Science': '📊', 'Cybersecurity': '🔐',
  'UI/UX Design': '🎨', 'Mobile Dev': '📱', 'DevOps & Cloud': '☁️',
  'AI & ML': '🤖', 'Business': '📈'
};
const IMAGE_MAP = {
  'Web Development': '../../assets/courses_img/react_js.png',
  'Data Science':    '../../assets/courses_img/python.png',
  'Cybersecurity':   '../../assets/courses_img/ethical_hacking.png',
  'UI/UX Design':    '../../assets/courses_img/ui_ux.png',
  'Mobile Dev':      '../../assets/courses_img/flutter.png',
  'DevOps & Cloud':  '../../assets/courses_img/docker.png',
  'AI & ML':         '../../assets/courses_img/Deep_Learning.png',
  'Business':        '../../assets/courses_img/react_js.png'
};
async function loadAdminCourses() {
  const r = await apiFetch('/courses');
  if (r.ok) {
    adminCourses = r.data;
    renderAdminCourses();
    updateOverview();
  }
}
function renderAdminCourses() {
  const tb = $id('courses-tbody');
  if (!tb) return;
  tb.innerHTML = adminCourses.map(c => `
    <tr>
      <td><span style="margin-right:.35rem">${c.emoji || '📚'}</span>${escHtml(c.title)}</td>
      <td class="text-muted">${escHtml(c.category)}</td>
      <td class="text-muted">${escHtml(c.instructor)}</td>
      <td>${(c.students || 0).toLocaleString()}</td>
      <td>${c.price == 0 ? '<span style="color:var(--success)">Free</span>' : '$' + c.price}</td>
      <td><span class="badge ${c.status === 'published' ? 'badge-medium' : 'badge-outline'}">${c.status}</span></td>
      <td>
        <button class="btn btn-ghost btn-icon del-course-btn" data-id="${c.course_id}" style="color:var(--destructive)" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </td>
    </tr>`).join('');
  document.querySelectorAll('.del-course-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Delete this course?')) return;
      const r = await apiFetch(`/courses/${btn.dataset.id}`, { method: 'DELETE' });
      if (r.ok) {
        await loadAdminCourses();
        toast({ title: 'Course Deleted' });
      } else {
        toast({ title: 'Error', desc: r.data.error || 'Delete failed', err: true });
      }
    };
  });
}
$id('open-add-course-btn').onclick = () => {
  openModal('add-course-modal');
  $id('c-image').value = '';
  hideEl('c-image-preview');
};
$id('cancel-add-course').onclick = () => closeModal('add-course-modal');
let courseImageData = null;
$id('c-image').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) { courseImageData = null; hideEl('c-image-preview'); return; }
  if (!file.type.startsWith('image/')) { toast({ title: 'Invalid File', desc: 'Please select an image file', err: true }); $id('c-image').value = ''; return; }
  if (file.size > 2 * 1024 * 1024) { toast({ title: 'File Too Large', desc: 'Max 2MB', err: true }); $id('c-image').value = ''; return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    courseImageData = ev.target.result;
    $id('c-image-preview-img').src = courseImageData;
    showEl('c-image-preview');
  };
  reader.readAsDataURL(file);
};
$id('save-course-btn').onclick = async () => {
  const title      = $id('c-title').value.trim();
  const instructor = $id('c-instructor').value.trim();
  const cat        = $id('c-cat').value;
  const price      = Number($id('c-price').value) || 0;
  const level      = $id('c-level').value;
  const errEl      = $id('c-err');
  errEl.classList.add('hidden');
  if (!title || !instructor) { errEl.textContent = 'Title and instructor are required'; errEl.classList.remove('hidden'); return; }
  const courseImage = courseImageData || IMAGE_MAP[cat] || '../../assets/courses_img/react_js.png';
  const payload = {
    title, instructor, category: cat, price, level, status: 'draft',
    emoji: EMOJI_MAP[cat] || '📚', image: courseImage
  };
  const r = await apiFetch('/courses', { method: 'POST', body: JSON.stringify(payload) });
  if (r.ok && r.data.success) {
    await loadAdminCourses();
    closeModal('add-course-modal');
    $id('c-title').value = $id('c-instructor').value = $id('c-image').value = '';
    courseImageData = null;
    hideEl('c-image-preview');
    toast({ title: 'Course Added', desc: title + ' added as draft.' });
  } else {
    toast({ title: 'Error', desc: r.data.error || 'Failed to add course', err: true });
  }
};
async function loadAnnouncements() {
  const r = await apiFetch('/announcements');
  if (r.ok) {
    announcements = r.data;
    renderAnnouncements();
    updateOverview();
  }
}
function renderAnnouncements() {
  const el      = $id('ann-list');
  const clearBtn = $id('clear-all-ann-btn');
  if (!el) return;
  clearBtn.classList.toggle('hidden', announcements.length === 0);
  if (announcements.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <h3>No announcements yet</h3><p>Create an announcement to broadcast to all students</p></div>`;
    return;
  }
  el.innerHTML = announcements.map(a => `
    <div class="announce-card">
      <div class="announce-card-header">
        <div>
          <div class="announce-title">${escHtml(a.title)}</div>
          <div class="announce-meta">
            <span class="badge-${escHtml(a.severity)}" style="margin-right:.35rem">${escHtml(a.severity)}</span>
            ${escHtml(a.author)} · ${escHtml(formatDate(a.created_at))}
          </div>
        </div>
        <button class="btn btn-ghost btn-icon del-ann-btn" data-id="${a.id}" style="color:var(--destructive)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
      <div class="announce-body">${escHtml(a.body)}</div>
    </div>`).join('');
  el.querySelectorAll('.del-ann-btn').forEach(btn => {
    btn.onclick = async () => {
      const r = await apiFetch(`/announcements/${btn.dataset.id}`, { method: 'DELETE' });
      if (r.ok) { await loadAnnouncements(); toast({ title: 'Announcement Removed' }); }
    };
  });
}
$id('open-ann-btn').onclick    = () => openModal('ann-modal');
$id('cancel-ann').onclick      = () => closeModal('ann-modal');
$id('clear-all-ann-btn').onclick = async () => {
  if (!confirm('Clear all announcements?')) return;
  const r = await apiFetch('/announcements/clear', { method: 'DELETE' });
  if (r.ok) { await loadAnnouncements(); toast({ title: 'All Announcements Cleared' }); }
};
$id('save-ann-btn').onclick = async () => {
  const title = $id('ann-title').value.trim();
  const body  = $id('ann-body').value.trim();
  const sev   = $id('ann-sev').value;
  if (!title || !body) { toast({ title: 'Fill in all fields', err: true }); return; }
  const r = await apiFetch('/announcements', {
    method: 'POST',
    body: JSON.stringify({ title, body, severity: sev, author: me?.username || 'Admin' })
  });
  if (r.ok && r.data.success) {
    await loadAnnouncements();
    closeModal('ann-modal');
    $id('ann-title').value = $id('ann-body').value = '';
    toast({ title: 'Announcement Broadcast', desc: title });
  } else {
    toast({ title: 'Error', desc: r.data.error || 'Failed', err: true });
  }
};
function loadLocalState(key, seed) {
  try { const s = localStorage.getItem('nx_' + key); return s ? JSON.parse(s) : seed; } catch { return seed; }
}
function saveLocalState(key, val) { localStorage.setItem('nx_' + key, JSON.stringify(val)); }
let platformSettings = loadLocalState('platform_settings', {
  platformName: 'Nexus Course Platform', adminEmail: 'admin@nexus.io', supportEmail: '',
  description: 'Online learning platform for professional development', language: 'English',
  timezone: 'UTC', currency: 'USD ($)', allowRegistration: true, emailVerification: true,
  adminApproval: false, autoEnroll: false, certificates: true, courseReviews: true,
  emailNotifications: true, announcementEmails: true, weeklyDigest: false
});
function loadSettings() {
  $id('setting-platform-name').value         = platformSettings.platformName;
  $id('setting-admin-email').value           = platformSettings.adminEmail;
  $id('setting-support-email').value         = platformSettings.supportEmail;
  $id('setting-description').value           = platformSettings.description;
  $id('setting-language').value              = platformSettings.language;
  $id('setting-timezone').value              = platformSettings.timezone;
  $id('setting-currency').value              = platformSettings.currency;
  $id('setting-allow-registration').checked  = platformSettings.allowRegistration;
  $id('setting-email-verification').checked  = platformSettings.emailVerification;
  $id('setting-admin-approval').checked      = platformSettings.adminApproval;
  $id('setting-auto-enroll').checked         = platformSettings.autoEnroll;
  $id('setting-certificates').checked        = platformSettings.certificates;
  $id('setting-course-reviews').checked      = platformSettings.courseReviews;
  $id('setting-email-notifications').checked = platformSettings.emailNotifications;
  $id('setting-announcement-emails').checked = platformSettings.announcementEmails;
  $id('setting-weekly-digest').checked       = platformSettings.weeklyDigest;
}
$id('save-settings-btn').onclick = () => {
  platformSettings.platformName       = $id('setting-platform-name').value.trim();
  platformSettings.adminEmail         = $id('setting-admin-email').value.trim();
  platformSettings.supportEmail       = $id('setting-support-email').value.trim();
  platformSettings.description        = $id('setting-description').value.trim();
  platformSettings.language           = $id('setting-language').value;
  platformSettings.timezone           = $id('setting-timezone').value;
  platformSettings.currency           = $id('setting-currency').value;
  platformSettings.allowRegistration  = $id('setting-allow-registration').checked;
  platformSettings.emailVerification  = $id('setting-email-verification').checked;
  platformSettings.adminApproval      = $id('setting-admin-approval').checked;
  platformSettings.autoEnroll         = $id('setting-auto-enroll').checked;
  platformSettings.certificates       = $id('setting-certificates').checked;
  platformSettings.courseReviews      = $id('setting-course-reviews').checked;
  platformSettings.emailNotifications = $id('setting-email-notifications').checked;
  platformSettings.announcementEmails = $id('setting-announcement-emails').checked;
  platformSettings.weeklyDigest       = $id('setting-weekly-digest').checked;
  saveLocalState('platform_settings', platformSettings);
  toast({ title: 'Settings Saved', desc: 'Platform settings have been updated' });
};
$id('reset-settings-btn').onclick = () => {
  if (!confirm('Reset all settings to default values?')) return;
  platformSettings = {
    platformName: 'Nexus Course Platform', adminEmail: 'admin@nexus.io', supportEmail: '',
    description: 'Online learning platform for professional development', language: 'English',
    timezone: 'UTC', currency: 'USD ($)', allowRegistration: true, emailVerification: true,
    adminApproval: false, autoEnroll: false, certificates: true, courseReviews: true,
    emailNotifications: true, announcementEmails: true, weeklyDigest: false
  };
  saveLocalState('platform_settings', platformSettings);
  loadSettings();
  toast({ title: 'Settings Reset', desc: 'All settings have been reset to defaults' });
};
const adminChangePwBtn = $id('admin-change-pw-btn');
if (adminChangePwBtn) {
  adminChangePwBtn.onclick = async () => {
    const curPw = $id('admin-cur-pw').value;
    const newPw = $id('admin-new-pw').value;
    const confirmPw = $id('admin-confirm-pw').value;
    const err = $id('admin-pw-err');
    err.classList.add('hidden');
    if (!curPw || !newPw || !confirmPw) {
      err.textContent = 'All fields are required';
      err.classList.remove('hidden');
      return;
    }
    if (newPw !== confirmPw) {
      err.textContent = 'New passwords do not match';
      err.classList.remove('hidden');
      return;
    }
    if (!me || !me.id) {
      err.textContent = 'Session error. Please re-login.';
      err.classList.remove('hidden');
      return;
    }
    try {
      const r = await apiRequest(`/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: me.id,
          current_password: curPw,
          new_password: newPw,
          confirm_password: confirmPw
        })
      });
      if (r.ok && r.data.success) {
        toast({ title: 'Success', desc: 'Password updated successfully' });
        $id('admin-cur-pw').value = '';
        $id('admin-new-pw').value = '';
        $id('admin-confirm-pw').value = '';
      } else {
        err.textContent = r.data.error || 'Failed to update password';
        err.classList.remove('hidden');
      }
    } catch (error) {
      err.textContent = 'A network error occurred.';
      err.classList.remove('hidden');
    }
  };
}
fillProfile();
loadSettings();
loadUsers();
loadAdminCourses();
loadAnnouncements();
