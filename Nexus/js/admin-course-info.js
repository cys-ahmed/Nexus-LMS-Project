(function () {
    if (!isLoggedIn()) { location.href = '../login.html'; return; }
    const u = getCurrentUser();
    if ((u?.role || '').toLowerCase() !== 'admin') location.href = '../user/dashboard.html';
})();
const me = getCurrentUser();
const urlParams = new URLSearchParams(window.location.search);
const courseId  = Number(urlParams.get('id'));
if (!courseId) location.href = 'courses.html';
let course      = null;
let enrollments = [];
let reviews     = [];
let curriculum  = [];
let uploadedImage = null;
setText('sidebar-user', me?.username || 'Admin');
$id('logout-btn').onclick = logout;
function openModal(id)  { $id(id)?.classList.add('open'); }
function closeModal(id) { $id(id)?.classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('open');
}));
async function loadCourse() {
    const r = await apiFetch('/courses/' + courseId);
    if (!r.ok) {
        toast({ title: 'Course Not Found', err: true });
        setTimeout(() => location.href = 'courses.html', 1500);
        return;
    }
    course = r.data;
    curriculum = course.curriculum || [];
    loadCourseForm();
}
async function loadEnrollments() {
    const r = await apiFetch('/enrollments?course_id=' + courseId);
    if (r.ok) {
        enrollments = r.data;
        renderStudents();
        updateRevenueStats();
    }
}
async function loadReviews() {
    const r = await apiFetch('/reviews?course_id=' + courseId);
    if (r.ok) {
        reviews = r.data;
        renderReviews();
    }
}
function loadCourseForm() {
    if (!course) return;
    $id('course-title').value       = course.title;
    $id('course-category').value    = course.category;
    $id('course-instructor').value  = course.instructor || '';
    $id('course-level').value       = course.level;
    $id('course-status').value      = course.status;
    $id('course-description').value = course.description || '';
    $id('course-price').value       = course.price || 0;
    const imgPreview = $id('course-image-preview');
    const imgSrc = course.image ? getImageUrl(course.image) : '';
    if (imgSrc) {
        imgPreview.innerHTML = `<img src="${imgSrc}" alt="${escHtml(course.title)}" style="width:100%;height:100%;object-fit:cover" />`;
        showEl('remove-image-btn');
    } else {
        imgPreview.textContent = course.emoji || '📚';
    }
    renderCurriculum();
}
$id('course-image-upload').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid File', err: true }); $id('course-image-upload').value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'File Too Large', desc: 'Max 2MB', err: true }); $id('course-image-upload').value = ''; return; }
    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedImage = event.target.result;
        $id('course-image-preview').innerHTML = `<img src="${uploadedImage}" alt="Course" style="width:100%;height:100%;object-fit:cover" />`;
        showEl('remove-image-btn');
        toast({ title: 'Image Uploaded', desc: 'Click Save Changes to apply' });
    };
    reader.onerror = () => toast({ title: 'Upload Failed', err: true });
    reader.readAsDataURL(file);
};
$id('remove-image-btn').onclick = () => {
    if (!confirm('Remove course image?')) return;
    uploadedImage = null;
    $id('course-image-upload').value = '';
    const imgPreview = $id('course-image-preview');
    imgPreview.innerHTML = '';
    imgPreview.textContent = course?.emoji || '📚';
    imgPreview.style.fontSize = '4rem';
    hideEl('remove-image-btn');
};
$id('save-course-btn').onclick = async () => {
    const title       = $id('course-title').value.trim();
    const category    = $id('course-category').value;
    const instructor  = $id('course-instructor').value.trim();
    const level       = $id('course-level').value;
    const status      = $id('course-status').value;
    const description = $id('course-description').value.trim();
    const price       = Number($id('course-price').value) || 0;
    if (!title || !instructor) { toast({ title: 'Validation Error', desc: 'Title and instructor are required', err: true }); return; }
    const EMOJI_MAP = {
        'Web Development': '💻', 'Data Science': '📊', 'Cybersecurity': '🔐',
        'UI/UX Design': '🎨', 'Mobile Dev': '📱', 'DevOps & Cloud': '☁️',
        'AI & ML': '🤖', 'Business': '📈'
    };
    const payload = { title, category, instructor, level, status, description, price, emoji: EMOJI_MAP[category] || '📚' };
    if (uploadedImage) payload.image = uploadedImage;
    const r = await apiFetch('/courses/' + courseId, { method: 'PUT', body: JSON.stringify(payload) });
    if (r.ok && r.data.success) {
        toast({ title: 'Course Updated', desc: 'Changes have been saved successfully' });
        await loadCourse();
        await loadEnrollments();
    } else {
        toast({ title: 'Error', desc: r.data.error || 'Update failed', err: true });
    }
};
$id('delete-course-btn').onclick = async () => {
    if (!course || !confirm(`Delete "${course.title}"? This action cannot be undone.`)) return;
    const r = await apiFetch('/courses/' + courseId, { method: 'DELETE' });
    if (r.ok) {
        toast({ title: 'Course Deleted', desc: course.title + ' has been removed' });
        setTimeout(() => location.href = 'courses.html', 1500);
    } else {
        toast({ title: 'Error', desc: r.data.error || 'Delete failed', err: true });
    }
};
function renderStudents() {
    const el      = $id('students-list');
    const countEl = $id('student-count');
    if (!el) return;
    if (enrollments.length === 0) {
        el.innerHTML = `<div class="empty-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
            </svg>
            <h3>No students enrolled</h3>
            <p>Students will appear here once they enroll</p>
        </div>`;
        setText('student-count', '0 students');
        return;
    }
    setText('student-count', enrollments.length + ' student' + (enrollments.length !== 1 ? 's' : ''));
    el.innerHTML = enrollments.map(e => `
        <div style="background:var(--secondary);border-radius:var(--radius);padding:1rem;display:flex;justify-content:space-between;align-items:center">
            <div class="flex items-center gap-3">
                <div class="avatar">${escHtml((e.username || 'U').slice(0, 2).toUpperCase())}</div>
                <div>
                    <div class="text-sm font-medium">${escHtml(e.username || '')}</div>
                    <div class="text-xs text-muted">${escHtml(e.email || '')}</div>
                </div>
            </div>
            <div style="text-align:right">
                <div class="text-sm font-medium">${e.progress || 0}% complete</div>
                <div class="text-xs text-muted">Enrolled ${formatDate(e.enrolled_at)}</div>
            </div>
        </div>
    `).join('');
}
function renderReviews() {
    const el = $id('reviews-list');
    if (!el) return;
    if (reviews.length === 0) {
        el.innerHTML = `<div class="empty-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <h3>No reviews yet</h3>
            <p>Reviews from students will appear here</p>
        </div>`;
        setText('avg-rating',   '0.0');
        setText('review-count', '(0 reviews)');
        return;
    }
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    const total     = reviews.length;
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1);
    setText('avg-rating',   avgRating);
    setText('review-count', '(' + total + ' review' + (total !== 1 ? 's' : '') + ')');
    for (let i = 1; i <= 5; i++) {
        const pct = Math.round((distribution[i] / total) * 100);
        if ($id('bar-' + i)) $id('bar-' + i).style.width = pct + '%';
        setText('pct-' + i, pct + '%');
    }
    el.innerHTML = reviews.map(r => `
        <div style="border-bottom:1px solid var(--border);padding-bottom:1.5rem">
            <div class="flex items-start gap-3">
                <div class="avatar">${escHtml((r.username || 'U').slice(0, 2).toUpperCase())}</div>
                <div style="flex:1">
                    <div class="flex items-center justify-between" style="margin-bottom:.5rem">
                        <div>
                            <div class="text-sm font-medium">${escHtml(r.username || '')}</div>
                            <div class="text-xs text-muted">${formatDate(r.created_at)}</div>
                        </div>
                        <div style="color:#f59e0b;font-size:.875rem">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <p class="text-sm" style="line-height:1.6">${escHtml(r.body || '')}</p>
                </div>
            </div>
        </div>`).join('');
}
function updateRevenueStats() {
    const revenue = (course?.price || 0) * enrollments.length;
    setText('total-revenue',      '$' + revenue.toLocaleString());
    setText('total-enrollments',  enrollments.length);
    setText('avg-price',          '$' + (course?.price || 0));
}
function renderCurriculum() {
    const el = $id('curriculum-sections');
    if (!el) return;
    if (curriculum.length === 0) {
        el.innerHTML = `<div class="empty-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <h3>No curriculum yet</h3>
            <p>Add sections and lectures to build your course content</p>
        </div>`;
        return;
    }
    el.innerHTML = curriculum.map((section, idx) => `
        <div style="background:var(--secondary);border-radius:var(--radius);padding:1rem">
            <div class="flex justify-between items-center">
                <div style="flex:1">
                    <div class="text-sm font-medium">${idx + 1}. ${escHtml(section.title)}</div>
                    <div class="text-xs text-muted" style="margin-top:.25rem">${escHtml(section.description || 'No description')}</div>
                </div>
                <button class="btn btn-ghost btn-icon delete-section-btn" data-idx="${idx}" style="color:var(--destructive)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                    </svg>
                </button>
            </div>
        </div>`).join('');
    el.querySelectorAll('.delete-section-btn').forEach(btn => {
        btn.onclick = () => {
            if (confirm('Delete this section?')) {
                curriculum.splice(Number(btn.dataset.idx), 1);
                renderCurriculum();
                toast({ title: 'Section Deleted' });
            }
        };
    });
}
$id('add-section-btn').onclick = () => { openModal('section-modal'); $id('section-title').value = $id('section-desc').value = ''; };
$id('cancel-section').onclick  = () => closeModal('section-modal');
$id('save-section-btn').onclick = () => {
    const title = $id('section-title').value.trim();
    const desc  = $id('section-desc').value.trim();
    if (!title) { toast({ title: 'Title Required', err: true }); return; }
    curriculum.push({ title, description: desc });
    renderCurriculum();
    closeModal('section-modal');
    toast({ title: 'Section Added' });
};
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $id('tab-' + b.dataset.tab)?.classList.add('active');
});
$id('add-objective-btn').onclick = () => {
    const list   = $id('objectives-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'flex gap-2';
    newDiv.innerHTML = `
        <input class="input" placeholder="What will students learn?" />
        <button class="btn btn-ghost btn-icon remove-objective-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>`;
    list.appendChild(newDiv);
    newDiv.querySelector('.remove-objective-btn').onclick = () => newDiv.remove();
};
async function init() {
    await loadCourse();
    await loadEnrollments();
    await loadReviews();
}
init();
