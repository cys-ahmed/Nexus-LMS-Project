(function () {
  if (!isLoggedIn()) { location.href = '../login.html'; return; }
  const u = getCurrentUser();
  if ((u?.role || '').toLowerCase() !== 'admin') location.href = '../user/dashboard.html';
})();
const me = getCurrentUser();
setText('sidebar-user', me?.username || 'Admin');
$id('logout-btn').onclick = logout;
const EMOJI_MAP = {
  'Web Development': '💻', 'Data Science': '📊', 'Cybersecurity': '🔐',
  'UI/UX Design': '🎨',   'Mobile Dev': '📱',   'DevOps & Cloud': '☁️',
  'AI & ML': '🤖',         'Business': '📈'
};
const IMAGE_MAP = {
  'Web Development': 'assets/courses_img/react_js.png',
  'Data Science':    'assets/courses_img/python.png',
  'Cybersecurity':   'assets/courses_img/ethical_hacking.png',
  'UI/UX Design':    'assets/courses_img/ui_ux.png',
  'Mobile Dev':      'assets/courses_img/flutter.png',
  'DevOps & Cloud':  'assets/courses_img/docker.png',
  'AI & ML':         'assets/courses_img/Deep_Learning.png',
  'Business':        'assets/courses_img/react_js.png'
};
let courses       = [];
let searchQuery   = '';
let statusFilter  = 'all';
let editingCourse = null;
function openModal(id)  { $id(id)?.classList.add('open'); }
function closeModal(id) { $id(id)?.classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => {
  if (e.target === o) o.classList.remove('open');
}));
async function loadCourses() {
  const r = await apiFetch('/courses');
  if (r.ok) {
    courses = r.data;
    await enrichWithEnrollments();
    renderCourses();
  }
}
async function enrichWithEnrollments() {
  const r = await apiFetch('/enrollments');
  if (!r.ok) return;
  const enrollments = r.data;
  courses.forEach(c => {
    c.enrollments = enrollments.filter(e => e.course_id === c.course_id);
  });
}
function renderCourses() {
  const el = $id('courses-grid');
  if (!el) return;
  let filtered = courses;
  if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
  if (searchQuery) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(searchQuery) ||
      (c.instructor || '').toLowerCase().includes(searchQuery) ||
      c.category.toLowerCase().includes(searchQuery)
    );
  }
  setText('course-count', filtered.length + ' course' + (filtered.length !== 1 ? 's' : ''));
  if (filtered.length === 0) {
    el.innerHTML = '<div style="grid-column:1/-1;padding:4rem;text-align:center;color:var(--muted-fg)"><h3>No courses found</h3><p style="margin-top:.5rem">Try adjusting your filters or search query</p></div>';
    return;
  }
  el.innerHTML = filtered.map(c => {
    const enrollmentCount = c.enrollments?.length || 0;
    const revenue         = c.price * enrollmentCount;
    const imgSrc = getImageUrl(c.image);
    return `
      <div class="course-card-admin" onclick="location.href='course-info.html?id=${c.course_id}'" style="cursor:pointer">
        <div class="course-thumb-admin" style="background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(124,58,237,.05));overflow:hidden;padding:0">
          <img src="${imgSrc}" alt="${escHtml(c.title)}" style="width:100%;height:100%;object-fit:cover"
               onerror="this.style.display='none';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.fontSize='3rem';this.parentElement.textContent='${c.emoji || '📚'}'"/>
          <span class="course-status-badge status-${c.status}">${c.status}</span>
        </div>
        <div class="course-body-admin">
          <div class="course-title-admin">${escHtml(c.title)}</div>
          <div class="course-meta-admin">
            <div>${escHtml(c.instructor || '')}</div>
            <div>${escHtml(c.category)} · ${escHtml(c.level)}</div>
          </div>
          <div class="course-stats">
            <div class="stat-item">
              <div class="stat-item-value">${enrollmentCount}</div>
              <div class="stat-item-label">Enrolled</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-value">$${revenue}</div>
              <div class="stat-item-label">Revenue</div>
            </div>
          </div>
          <div class="course-actions">
            <button class="btn btn-outline btn-sm flex-1 view-details-btn" data-id="${c.course_id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              View Details
            </button>
            <button class="btn btn-outline btn-sm flex-1 view-enrollments-btn" data-id="${c.course_id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Students
            </button>
            <button class="btn btn-ghost btn-icon delete-course-btn" data-id="${c.course_id}" style="color:var(--destructive)" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.onclick = (e) => { e.stopPropagation(); location.href = 'course-info.html?id=' + btn.dataset.id; };
  });
  el.querySelectorAll('.view-enrollments-btn').forEach(btn => {
    btn.onclick = (e) => { e.stopPropagation(); viewEnrollments(Number(btn.dataset.id)); };
  });
  el.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.onclick = (e) => { e.stopPropagation(); deleteCourse(Number(btn.dataset.id)); };
  });
}
function viewEnrollments(courseId) {
  const course = courses.find(c => c.course_id === courseId);
  if (!course) return;
  setText('modal-course-name', course.title);
  const enrs = course.enrollments || [];
  setText('modal-enrollment-count', enrs.length);
  const list = $id('enrollment-list');
  if (enrs.length === 0) {
    list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted-fg)">No students enrolled yet</div>';
  } else {
    list.innerHTML = enrs.map(e => `
      <div class="enrollment-item">
        <div class="user-info-sm">
          <div class="avatar">${escHtml((e.username || 'U').slice(0, 2).toUpperCase())}</div>
          <div>
            <div class="text-sm font-medium">${escHtml(e.username || '')}</div>
            <div class="text-xs text-muted">${escHtml(e.email || '')}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="text-sm font-medium">${e.progress || 0}%</div>
          <div class="text-xs text-muted">${formatDate(e.enrolled_at)}</div>
        </div>
      </div>`).join('');
  }
  openModal('enrollments-modal');
}
$id('open-add-course-btn')?.addEventListener('click', () => {
  editingCourse = null;
  setText('modal-title', 'Add New Course');
  $id('c-title').value      = '';
  $id('c-instructor').value = '';
  $id('c-cat').value        = 'Web Development';
  $id('c-price').value      = '0';
  $id('c-level').value      = 'Beginner';
  $id('c-status').value     = 'draft';
  $id('c-desc').value       = '';
  hideEl('c-err');
  openModal('course-modal');
});
function editCourse(courseId) {
  const course = courses.find(c => c.course_id === courseId);
  if (!course) return;
  editingCourse = course;
  setText('modal-title', 'Edit Course');
  $id('c-title').value      = course.title;
  $id('c-instructor').value = course.instructor || '';
  $id('c-cat').value        = course.category;
  $id('c-price').value      = course.price;
  $id('c-level').value      = course.level;
  $id('c-status').value     = course.status;
  $id('c-desc').value       = course.description || '';
  hideEl('c-err');
  openModal('course-modal');
}
$id('save-course-btn')?.addEventListener('click', async () => {
  const title       = $id('c-title').value.trim();
  const instructor  = $id('c-instructor').value.trim();
  const category    = $id('c-cat').value;
  const price       = Number($id('c-price').value) || 0;
  const level       = $id('c-level').value;
  const status      = $id('c-status').value;
  const description = $id('c-desc').value.trim();
  const errEl       = $id('c-err');
  hideEl('c-err');
  if (!title || !instructor) {
    errEl.textContent = 'Title and instructor are required';
    showEl('c-err');
    return;
  }
  const payload = {
    title, instructor, category, price, level, status, description,
    emoji: EMOJI_MAP[category] || '📚',
    image: IMAGE_MAP[category] || 'assets/courses_img/react_js.png'
  };
  let r;
  if (editingCourse) {
    r = await apiFetch(`/courses/${editingCourse.course_id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (r.ok) toast({ title: 'Course Updated', desc: title });
  } else {
    r = await apiFetch('/courses', { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) toast({ title: 'Course Added', desc: title + ' has been created' });
  }
  if (r.ok) {
    closeModal('course-modal');
    await loadCourses();
  } else {
    errEl.textContent = r.data.error || 'Save failed';
    showEl('c-err');
  }
});
async function deleteCourse(courseId) {
  const course = courses.find(c => c.course_id === courseId);
  if (!course) return;
  if (!confirm(`Delete "${course.title}"? This action cannot be undone.`)) return;
  const r = await apiFetch(`/courses/${courseId}`, { method: 'DELETE' });
  if (r.ok) {
    await loadCourses();
    toast({ title: 'Course Deleted', desc: course.title + ' has been removed' });
  } else {
    toast({ title: 'Error', desc: r.data.error || 'Delete failed', err: true });
  }
}
$id('cancel-course')?.addEventListener('click', () => { closeModal('course-modal'); editingCourse = null; });
$id('close-enrollments')?.addEventListener('click', () => closeModal('enrollments-modal'));
$id('search-box')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCourses();
});
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    statusFilter = chip.dataset.filter;
    renderCourses();
  });
});
loadCourses();
