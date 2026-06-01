(function () { if (!isLoggedIn()) location.href = '../login.html' })();
const me = getCurrentUser() || { username: 'Student', email: '', role: 'Student', id: 0 };
setText('sidebar-user', me.username);
setText('topbar-user', me.username);
const av = document.getElementById('user-av'); if (av) av.textContent = me.username.slice(0, 2).toUpperCase();
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  document.getElementById('tab-' + b.dataset.tab)?.classList.add('active');
});
document.getElementById('logout-btn').onclick = logout;
const IMG = '../../assets/courses_img/';
async function loadEnrolled() {
  const r = await apiFetch('/enrollments?user_id=' + me.id);
  if (!r.ok) {
    toast({ title: 'Error', desc: 'Could not load enrolled courses', err: true });
    return;
  }
  const enrolled = r.data;
  const completed = enrolled.filter(c => c.progress === 100).length;
  const avgProgress = enrolled.length > 0
    ? Math.round(enrolled.reduce((s, c) => s + (c.progress || 0), 0) / enrolled.length)
    : 0;
  setText('stat-enrolled', enrolled.length);
  setText('stat-completed', completed);
  setText('stat-progress', avgProgress + '%');
  setText('stat-hours', Math.round(enrolled.reduce((s, c) => s + (c.progress || 0) * 0.1, 0)) + 'h');
  renderEnrolled(enrolled);
  renderRecent(enrolled);
}
function renderEnrolled(enrolled) {
  const el = document.getElementById('enrolled-list');
  if (!el) return;
  if (enrolled.length === 0) {
    el.innerHTML = '<div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--muted-fg)"><h3>No courses yet</h3><p>Browse the catalog and enroll in a course!</p><button class="btn btn-default btn-sm" style="margin-top:1rem" onclick="location.href=\'courses.html\'">Browse Courses</button></div>';
    return;
  }
  el.innerHTML = enrolled.map(c => {
    const imgSrc = getImageUrl(c.image);
    const color  = '#7c3aed';
    return `
    <div class="course-card" onclick="location.href='course-info.html?id=${c.course_id}'" style="cursor:pointer">
      <div class="course-thumb" style="background:${color}18;padding:0;overflow:hidden">
        <img src="${imgSrc}" alt="${escHtml(c.title)}" style="width:100%;height:100%;object-fit:cover"
             onerror="this.style.display='none';this.parentElement.style.background='${color}22';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.fontSize='2.5rem';this.parentElement.textContent='📚'"/>
      </div>
      <div class="course-body">
        <div class="course-title">${escHtml(c.title)}</div>
        <div class="course-meta"><span>${escHtml(c.instructor || '')}</span></div>
        <div class="flex items-center gap-2" style="margin-top:.5rem">
          <div class="progress" style="flex:1"><div class="progress-bar" style="width:${c.progress || 0}%;background:${color}"></div></div>
          <span class="text-xs text-muted">${c.progress || 0}%</span>
        </div>
        <div class="course-footer">
          <span class="badge badge-outline">${escHtml(c.category || '')}</span>
          <button class="btn btn-sm btn-default" onclick="event.stopPropagation();location.href='course-info.html?id=${c.course_id}'">Continue</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderRecent(enrolled) {
  const el = document.getElementById('recent-list');
  if (!el) return;
  const recent = enrolled.slice(0, 3);
  if (recent.length === 0) {
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted-fg)">No activity yet</div>';
    return;
  }
  el.innerHTML = recent.map(r => {
    const imgSrc = getImageUrl(r.image);
    return `
    <div class="flex items-center gap-4" style="padding:.75rem 0;border-bottom:1px solid var(--border)">
      <div style="width:2.5rem;height:2.5rem;border-radius:var(--radius);overflow:hidden;flex-shrink:0">
        <img src="${imgSrc}" alt="" style="width:100%;height:100%;object-fit:cover"
             onerror="this.parentElement.style.background='var(--secondary)';this.style.display='none'"/>
      </div>
      <div style="flex:1;min-width:0">
        <div class="text-sm font-medium">${escHtml(r.title)}</div>
        <div class="text-xs text-muted">${escHtml(r.category || '')}</div>
      </div>
      <span class="text-xs text-muted">${r.progress || 0}% done</span>
    </div>`;
  }).join('');
}
loadEnrolled();
