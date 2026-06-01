(function () {
  if (!isLoggedIn()) location.href = '../login.html';
})();
const me = getCurrentUser() || {};
const av = $id('user-av');
if (av) av.textContent = (me.username || 'U').slice(0, 2).toUpperCase();
const pav = $id('profile-av');
if (pav) pav.textContent = (me.username || 'U').slice(0, 2).toUpperCase();
setText('sidebar-user',    me.username || 'User');
setText('profile-name',    me.username || 'User');
setText('profile-email',   me.email    || '—');
setText('profile-role',    me.role     || 'Student');
setText('profile-role-badge', me.role  || 'Student');
setText('profile-joined',  formatDate(me.joined || new Date().toISOString()));
setText('profile-login',   formatDate(new Date().toISOString()));
$id('logout-btn').onclick = logout;
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $id('tab-' + b.dataset.tab)?.classList.add('active');
});
const IMG = '../../assets/courses_img/';
async function loadUserData() {
  const r = await apiFetch('/enrollments?user_id=' + me.id);
  if (!r.ok) {
    toast({ title: 'Error', desc: 'Could not load your data', err: true });
    return;
  }
  const enrolled = r.data;
  const completed = enrolled.filter(c => c.progress === 100);
  const totalHours = Math.round(enrolled.reduce((s, c) => s + (c.progress || 0) * 0.1, 0));
  const avgProgress = enrolled.length > 0
    ? Math.round(enrolled.reduce((s, c) => s + (c.progress || 0), 0) / enrolled.length)
    : 0;
  setText('stat-enrolled',  enrolled.length);
  setText('stat-completed', completed.length);
  setText('stat-hours',     totalHours + 'h');
  setText('stat-avg',       avgProgress + '%');
  const interestsEl = $id('interests-list');
  if (interestsEl) {
    interestsEl.innerHTML = '';
    [...new Set(enrolled.map(c => c.category))].forEach(cat => {
      const b = document.createElement('span');
      b.className = 'badge badge-outline';
      b.textContent = cat;
      interestsEl.appendChild(b);
    });
  }
  renderProgress(enrolled);
  renderCerts(enrolled);
}
function renderProgress(enrolled) {
  const el = $id('progress-list');
  if (!el) return;
  if (enrolled.length === 0) {
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted-fg)">No courses yet. <a href="courses.html">Browse courses</a></div>';
    return;
  }
  el.innerHTML = enrolled.map(c => {
    const imgSrc = getImageUrl(c.image);
    const color  = '#7c3aed';
    return `
    <div class="enroll-card">
      <div class="enroll-emoji" style="padding:0;overflow:hidden;border-radius:var(--radius)">
        <img src="${imgSrc}" alt="${escHtml(c.title)}" style="width:3rem;height:3rem;object-fit:cover;display:block"
             onerror="this.style.display='none';this.parentElement.style.background='${color}22';this.parentElement.style.fontSize='1.5rem';this.parentElement.textContent='📚'"/>
      </div>
      <div class="enroll-body">
        <div class="enroll-title">${escHtml(c.title)}</div>
        <div class="enroll-meta">${escHtml(c.instructor || '')} · <span class="badge badge-outline">${escHtml(c.category || '')}</span></div>
        <div class="flex items-center gap-2">
          <div class="progress" style="flex:1"><div class="progress-bar" style="width:${c.progress || 0}%;background:${color}"></div></div>
          <span class="text-xs text-muted">${c.progress || 0}%</span>
        </div>
      </div>
      <button class="btn btn-default btn-sm" style="flex-shrink:0" onclick="location.href='course-info.html?id=${c.course_id}'">Continue</button>
    </div>`;
  }).join('');
}
function renderCerts(enrolled) {
  const el = $id('certs-list');
  if (!el) return;
  const finished = enrolled.filter(c => (c.progress || 0) >= 90);
  if (finished.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
      <h3>No certificates yet</h3><p>Complete a course to earn your certificate</p></div>`;
    return;
  }
  el.innerHTML = finished.map(c => {
    const imgSrc = getImageUrl(c.image);
    return `
    <div class="cert-card">
      <div class="cert-icon" style="padding:0;overflow:hidden">
        <img src="${imgSrc}" alt="" style="width:3rem;height:3rem;object-fit:cover"
             onerror="this.style.display='none';this.parentElement.innerHTML='<svg width=20 height=20 viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'hsl(217,91%,60%)\\' stroke-width=2><circle cx=12 cy=8 r=6/><path d=\\'M15.477 12.89L17 22l-5-3-5 3 1.523-9.11\\'/></svg>'"/>
      </div>
      <div style="flex:1;min-width:0">
        <div class="text-sm font-medium">${escHtml(c.title)}</div>
        <div class="text-xs text-muted" style="margin-top:.15rem">${escHtml(c.instructor || '')} · Completed</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="toast({title:'Download coming soon'})">Download PDF</button>
    </div>`;
  }).join('');
}
async function renderUserAnnouncements() {
  const el = $id('user-ann-list');
  if (!el) return;
  const r = await apiFetch('/announcements');
  if (!r.ok) return;
  const ann = r.data;
  if (ann.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <h3>No announcements</h3><p>Check back later for platform updates</p></div>`;
    return;
  }
  el.innerHTML = ann.map(a => `
    <div class="announce-card">
      <div class="announce-title">${escHtml(a.title)}</div>
      <div class="announce-meta">
        <span class="badge-${escHtml(a.severity)}">${escHtml(a.severity)}</span>
        &nbsp;·&nbsp; ${escHtml(a.author)} · ${formatDate(a.created_at)}
      </div>
      <div class="announce-body">${escHtml(a.body)}</div>
    </div>`).join('');
}
loadUserData();
renderUserAnnouncements();
