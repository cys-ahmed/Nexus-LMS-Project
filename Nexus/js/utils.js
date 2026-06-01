const API = '/api';
function formatDate(iso) { try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return iso || '' } }
function escHtml(s) { if (typeof s !== 'string') return String(s || ''); return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function $id(id) { return document.getElementById(id) }
function setText(id, v) { const e = $id(id); if (e) e.textContent = v }
function showEl(id) { $id(id)?.classList.remove('hidden') }
function hideEl(id) { $id(id)?.classList.add('hidden') }
function toast({ title = '', desc = '', err = false } = {}) {
  const c = $id('toast-container'); if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = (title ? `<div class="toast-title">${escHtml(title)}</div>` : '') +
    (desc ? `<div class="toast-desc">${escHtml(desc)}</div>` : '');
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300) }, 4000);
}
function isLoggedIn() { return !!localStorage.getItem('nx_user') }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('nx_user')) || null } catch { return null } }
function clearSession() { localStorage.removeItem('nx_user') }
function logout() {
  clearSession();
  const path = window.location.pathname;
  if (path.includes('/pages/admin/')) {
    window.location.href = '../login.html';
  } else if (path.includes('/pages/user/')) {
    window.location.href = '../login.html';
  } else if (path.includes('/pages/')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
}
function getDashboard(user) {
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') return 'admin/dashboard.html';
  return 'user/dashboard.html';
}
async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    console.error('[apiFetch]', path, e);
    return { ok: false, status: 0, data: { error: e.message } };
  }
}
function getImageUrl(imagePath, defaultImg = 'react_js.png') {
    if (!imagePath) return '../../assets/courses_img/' + defaultImg;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    return '../../' + imagePath;
}
