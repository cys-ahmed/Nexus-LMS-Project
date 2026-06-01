(function () {
    if (!isLoggedIn()) { location.href = '../login.html'; return; }
    const u = getCurrentUser();
    if ((u?.role || '').toLowerCase() === 'admin') location.href = '../admin/admin.html';
})();
const me = getCurrentUser();
const urlParams = new URLSearchParams(window.location.search);
const courseId  = Number(urlParams.get('id'));
if (!courseId) location.href = 'courses.html';
let course      = null;
let enrollment  = null;   
let reviews     = [];
let isEnrolled  = false;
setText('sidebar-user', me.username);
const av = $id('user-av'); if (av) av.textContent = me.username.slice(0, 2).toUpperCase();
$id('logout-btn').onclick = logout;
async function loadCourse() {
    const r = await apiFetch('/courses/' + courseId);
    if (!r.ok) {
        toast({ title: 'Course Not Found', err: true });
        setTimeout(() => location.href = 'courses.html', 1500);
        return;
    }
    course = r.data;
    renderCourse();
}
async function loadEnrollment() {
    const r = await apiFetch('/enrollments?user_id=' + me.id);
    if (r.ok) {
        enrollment = r.data.find(e => e.course_id === courseId) || null;
        isEnrolled = !!enrollment;
    }
    updateEnrollUI();
}
async function loadReviews() {
    const r = await apiFetch('/reviews?course_id=' + courseId);
    if (r.ok) {
        reviews = r.data;
        renderReviews();
    }
}
function renderCourse() {
    if (!course) return;
    setText('course-title',    course.title);
    setText('course-category', course.category);
    setText('course-instructor', course.instructor || '');
    setText('course-rating',   '4.8');
    setText('course-students', (course.students || 0).toLocaleString() + ' students');
    setText('course-level',    course.level);
    setText('detail-level',    course.level);
    const priceEl = $id('course-price');
    if (course.price == 0) {
        priceEl.innerHTML = '<span style="color:var(--success)">Free</span>';
    } else {
        priceEl.textContent = '$' + course.price;
    }
    const imgContainer = $id('course-image');
    const imgSrc = course.image ? getImageUrl(course.image) : '';
    if (imgSrc) {
        imgContainer.innerHTML = `<img src="${imgSrc}" alt="${escHtml(course.title)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.style.fontSize='4rem';this.parentElement.textContent='${course.emoji || '📚'}'"/>`;
    } else {
        imgContainer.textContent = course.emoji || '📚';
    }
    setText('course-description', course.description || 'This course provides comprehensive training in ' + course.title + '. Learn from industry experts and gain practical skills.');
    setText('instructor-name', course.instructor || '');
    const instructorAvatar = $id('instructor-avatar');
    if (instructorAvatar && course.instructor) {
        instructorAvatar.textContent = course.instructor.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}
function updateEnrollUI() {
    if (isEnrolled) {
        hideEl('enroll-btn');
        showEl('unenroll-btn');
        setText('enrollment-status', '✓ You are enrolled in this course');
        showEl('add-review-section');
    } else {
        showEl('enroll-btn');
        hideEl('unenroll-btn');
        setText('enrollment-status', '');
        hideEl('add-review-section');
    }
}
$id('enroll-btn').onclick = async () => {
    if (isEnrolled) { toast({ title: 'Already Enrolled' }); return; }
    const r = await apiFetch('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ user_id: me.id, course_id: courseId })
    });
    if (r.ok && r.data.success) {
        toast({ title: 'Enrolled Successfully', desc: 'You are now enrolled in ' + course.title });
        await loadEnrollment();
    } else {
        toast({ title: 'Error', desc: r.data.error || 'Enrollment failed', err: true });
    }
};
$id('unenroll-btn').onclick = async () => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    const r = await apiFetch('/enrollments/by-user-course', {
        method: 'DELETE',
        body: JSON.stringify({ user_id: me.id, course_id: courseId })
    });
    if (r.ok) {
        toast({ title: 'Unenrolled', desc: 'You have been unenrolled from ' + course.title });
        enrollment = null;
        isEnrolled = false;
        updateEnrollUI();
    } else {
        toast({ title: 'Error', desc: r.data.error || 'Unenroll failed', err: true });
    }
};
function renderCurriculum() {
    const el = $id('curriculum-list');
    if (!el) return;
    const curriculum = [
        { title: 'Getting Started',     lectures: 8,  duration: '45min' },
        { title: 'Core Concepts',       lectures: 15, duration: '2h 30min' },
        { title: 'Advanced Topics',     lectures: 20, duration: '4h 15min' },
        { title: 'Real-World Projects', lectures: 12, duration: '3h 20min' },
        { title: 'Best Practices',      lectures: 10, duration: '1h 45min' },
        { title: 'Testing & Debugging', lectures: 8,  duration: '1h 30min' },
        { title: 'Deployment',          lectures: 6,  duration: '1h 15min' },
        { title: 'Bonus Content',       lectures: 5,  duration: '45min' }
    ];
    el.innerHTML = curriculum.map((section, idx) => `
        <div style="background:var(--secondary);border-radius:var(--radius);padding:1rem">
            <div class="flex justify-between items-center">
                <div>
                    <div class="text-sm font-medium">${idx + 1}. ${escHtml(section.title)}</div>
                    <div class="text-xs text-muted" style="margin-top:.25rem">${section.lectures} lectures · ${section.duration}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--muted-fg)">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
        </div>`).join('');
}
function renderReviews() {
    const el = $id('reviews-list');
    if (!el) return;
    if (reviews.length === 0) {
        el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted-fg)">No reviews yet. Be the first to review this course!</div>';
        return;
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
                    <p class="text-sm" style="line-height:1.6">${escHtml(r.body)}</p>
                </div>
            </div>
        </div>`).join('');
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    setText('avg-rating',    avgRating);
    setText('total-reviews', reviews.length + ' review' + (reviews.length !== 1 ? 's' : ''));
}
let selectedRating = 0;
document.querySelectorAll('.star-btn').forEach(btn => {
    btn.onclick = () => {
        selectedRating = Number(btn.dataset.rating);
        document.querySelectorAll('.star-btn').forEach((b, idx) => {
            b.style.color = idx < selectedRating ? '#f59e0b' : 'var(--muted-fg)';
        });
    };
});
$id('submit-review-btn').onclick = async () => {
    if (!isEnrolled) { toast({ title: 'Not Enrolled', desc: 'You must be enrolled to leave a review', err: true }); return; }
    if (selectedRating === 0) { toast({ title: 'Select Rating', desc: 'Please select a star rating', err: true }); return; }
    const text = $id('review-text').value.trim();
    if (!text) { toast({ title: 'Write Review', desc: 'Please write your review', err: true }); return; }
    if (reviews.some(r => r.user_id === me.id)) { toast({ title: 'Already Reviewed', err: true }); return; }
    const r = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ user_id: me.id, course_id: courseId, rating: selectedRating, body: text })
    });
    if (r.ok && r.data.success) {
        toast({ title: 'Review Submitted', desc: 'Thank you for your feedback!' });
        $id('review-text').value = '';
        selectedRating = 0;
        document.querySelectorAll('.star-btn').forEach(b => b.style.color = 'var(--muted-fg)');
        await loadReviews();
    } else {
        toast({ title: 'Error', desc: r.data.error || 'Review failed', err: true });
    }
};
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $id('tab-' + b.dataset.tab)?.classList.add('active');
});
async function init() {
    await loadCourse();
    await loadEnrollment();
    renderCurriculum();
    await loadReviews();
}
init();
