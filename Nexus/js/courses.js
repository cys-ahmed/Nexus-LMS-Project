(function () { if (!isLoggedIn()) location.href = '../login.html' })();
const me = getCurrentUser() || { username: 'Student' };
setText('sidebar-user', me.username);
const av = document.getElementById('user-av'); if (av) av.textContent = me.username.slice(0, 2).toUpperCase();
document.getElementById('logout-btn').onclick = logout;
const IMG = '../../assets/courses_img/';
const CATEGORIES = [
  { id: 'Web Development', name: 'Web Development', emoji: '💻', color: '#7c3aed', desc: 'HTML, CSS, JavaScript, React, Node.js and more' },
  { id: 'Data Science',    name: 'Data Science',    emoji: '📊', color: '#06b6d4', desc: 'Python, Machine Learning, AI, Statistics' },
  { id: 'Cybersecurity',   name: 'Cybersecurity',   emoji: '🔐', color: '#ef4444', desc: 'Ethical Hacking, Network Security, OSCP' },
  { id: 'UI/UX Design',    name: 'UI/UX Design',    emoji: '🎨', color: '#f59e0b', desc: 'Figma, Adobe XD, User Research, Prototyping' },
  { id: 'Mobile Dev',      name: 'Mobile Dev',      emoji: '📱', color: '#22c55e', desc: 'iOS (Swift), Android (Kotlin), Flutter, React Native' },
  { id: 'DevOps & Cloud',  name: 'DevOps & Cloud',  emoji: '☁️', color: '#8b5cf6', desc: 'Docker, Kubernetes, AWS, CI/CD Pipelines' },
  { id: 'AI & ML',         name: 'AI & ML',         emoji: '🤖', color: '#ec4899', desc: 'Deep Learning, NLP, Computer Vision, PyTorch' },
  { id: 'Business',        name: 'Business',        emoji: '📈', color: '#14b8a6', desc: 'Project Management, Marketing, Entrepreneurship' },
];
let ALL_COURSES = [];
let activeCat   = 'all';
let searchQ     = '';
function renderCategories() {
  const el = document.getElementById('cat-grid'); if (!el) return;
  const allCount = ALL_COURSES.filter(c => c.status === 'published').length;
  const categoriesWithCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: ALL_COURSES.filter(c => c.category === cat.id && c.status === 'published').length
  }));
  el.innerHTML = [{ id: 'all', name: 'All Categories', emoji: '🌟', count: allCount, color: '#7c3aed' }, ...categoriesWithCounts].map(c => {
    return `<a href="#" class="cat-card${activeCat === c.id ? ' active' : ''}" onclick="filterCat('${c.id}');return false">
      <div class="cat-icon" style="background:${(c.color || '#7c3aed')}22;font-size:1.5rem">${c.emoji}</div>
      <div><div class="cat-name">${escHtml(c.name)}</div><div class="cat-count">${c.count} courses</div></div>
    </a>`;
  }).join('');
}
function renderCourses() {
  const el = document.getElementById('course-grid'); if (!el) return;
  let list = ALL_COURSES.filter(c => c.status === 'published');
  if (activeCat !== 'all') list = list.filter(c => c.category === activeCat);
  if (searchQ) list = list.filter(c => c.title.toLowerCase().includes(searchQ) || (c.instructor || '').toLowerCase().includes(searchQ));
  setText('course-count', list.length + ' courses');
  if (list.length === 0) {
    el.innerHTML = '<div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--muted-fg)">No courses found.</div>';
    return;
  }
  el.innerHTML = list.map(c => {
    const category = CATEGORIES.find(cat => cat.id === c.category);
    const color    = category ? category.color : '#7c3aed';
    const imgSrc = getImageUrl(c.image);
    return `
    <div class="course-card" onclick="location.href='course-info.html?id=${c.course_id}'" style="cursor:pointer">
      <div class="course-thumb" style="background:${color}18;overflow:hidden;padding:0">
        <img src="${imgSrc}" alt="${escHtml(c.title)}" style="width:100%;height:100%;object-fit:cover"
             onerror="this.style.display='none';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.fontSize='2.5rem';this.parentElement.textContent='${c.emoji || '📚'}'"/>
      </div>
      <div class="course-body">
        <div class="course-title">${escHtml(c.title)}</div>
        <div class="course-meta"><span>${escHtml(c.instructor || '')}</span><span>${c.level}</span></div>
        <div class="flex items-center gap-2" style="font-size:.75rem;color:#f59e0b;margin-bottom:.5rem">
          ★ 4.8 <span style="color:var(--muted-fg)">(${(c.students || 0).toLocaleString()} students)</span>
        </div>
        <div class="course-footer">
          <span style="font-weight:700;font-size:1rem">${c.price == 0 ? '<span style="color:var(--success)">Free</span>' : '$' + c.price}</span>
          <button class="btn btn-sm btn-default">View Details</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
window.filterCat = function (id) { activeCat = id; renderCategories(); renderCourses() };
document.getElementById('search-box')?.addEventListener('input', e => { searchQ = e.target.value.toLowerCase().trim(); renderCourses(); });
async function init() {
  const r = await apiFetch('/courses');
  if (r.ok) {
    ALL_COURSES = r.data;
  } else {
    toast({ title: 'Error', desc: 'Could not load courses from server', err: true });
  }
  renderCategories();
  renderCourses();
}
init();
