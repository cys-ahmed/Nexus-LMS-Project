(function () {
  if (!isLoggedIn()) { location.href = '../login.html'; return; }
  const u = getCurrentUser();
  if ((u?.role || '').toLowerCase() !== 'admin') location.href = '../user/dashboard.html';
})();
const me = getCurrentUser();
setText('sidebar-user', me?.username || 'Admin');
$id('logout-btn').onclick = logout;
async function updateStats() {
  const r = await apiFetch('/stats');
  if (!r.ok) return;
  const s = r.data;
  setText('stat-students',    s.students);
  setText('stat-courses',     s.active_courses);
  setText('stat-enrollments', s.total_enrollments);
  setText('stat-revenue',     '$' + Number(s.revenue).toLocaleString());
}
let searchQuery = '';
let allCourses  = [];
async function loadCourses() {
  const r = await apiFetch('/courses');
  if (!r.ok) return;
  allCourses = r.data;
  renderCourses();
}
function renderCourses() {
  const el = $id('courses-list');
  if (!el) return;
  let filtered = allCourses;
  if (searchQuery) {
    filtered = allCourses.filter(c =>
      c.title.toLowerCase().includes(searchQuery) ||
      (c.instructor || '').toLowerCase().includes(searchQuery) ||
      c.category.toLowerCase().includes(searchQuery)
    );
  }
  if (filtered.length === 0) {
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted-fg)">No courses found</div>';
    return;
  }
  el.innerHTML = filtered.map(c => {
    return `
      <div class="course-row">
        <div class="course-info">
          <div class="course-thumb-sm">${c.emoji || '📚'}</div>
          <div class="course-details">
            <h4>${escHtml(c.title)}</h4>
            <p>${escHtml(c.instructor || '')}</p>
          </div>
        </div>
        <div class="text-sm text-muted">${escHtml(c.category)}</div>
        <div class="text-sm">
          <span class="enrollment-badge">${c.enrolled_count || 0}</span>
        </div>
        <div class="text-sm font-medium">$${(c.price * (c.enrolled_count || 0)).toLocaleString()}</div>
        <div>
          <span class="badge ${c.status === 'published' ? 'badge-medium' : c.status === 'draft' ? 'badge-outline' : 'badge-secondary'}">${c.status}</span>
        </div>
      </div>
    `;
  }).join('');
}
$id('course-search')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCourses();
});
updateStats();
loadCourses();
