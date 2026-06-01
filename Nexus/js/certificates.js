(function () {
    if (!isLoggedIn()) { location.href = '../login.html'; return; }
    const u = getCurrentUser();
    if ((u?.role || '').toLowerCase() === 'admin') location.href = '../admin/admin.html';
})();
const me = getCurrentUser();
setText('sidebar-user', me.username || 'User');
const initials = (me.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
$id('user-av').textContent = initials;
function openModal(id)  { $id(id)?.classList.add('open'); }
function closeModal(id) { $id(id)?.classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('open');
}));
$id('logout-btn').onclick = logout;
let certificates = [];
let enrollments  = [];
async function loadData() {
    const r = await apiFetch('/enrollments?user_id=' + me.id);
    if (!r.ok) return;
    enrollments = r.data;
    certificates = enrollments
        .filter(e => (e.progress || 0) === 100)
        .map(e => ({
            id:             'CERT-' + e.course_id + '-' + me.id,
            courseId:       e.course_id,
            courseName:     e.title,
            studentName:    me.username || 'Student',
            instructor:     e.instructor || 'Instructor',
            issuedDate:     e.last_accessed || new Date().toISOString(),
            completionDate: e.last_accessed || new Date().toISOString()
        }));
    const inProgress   = enrollments.filter(e => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
    const thisYear     = new Date().getFullYear();
    const thisYearCerts = certificates.filter(c => new Date(c.issuedDate).getFullYear() === thisYear).length;
    setText('total-certs', certificates.length);
    setText('this-year',   thisYearCerts);
    setText('in-progress', inProgress);
    renderCertificates();
}
function renderCertificates(filter = 'all') {
    const container = $id('certificates-list');
    if (certificates.length === 0) {
        container.innerHTML = `
      <div style="grid-column:1/-1;padding:4rem;text-align:center;color:var(--muted-fg)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 1rem;opacity:.3">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
        <h3>No Certificates Yet</h3>
        <p style="margin-top:.5rem">Complete courses to earn certificates</p>
        <button class="btn btn-default btn-sm" style="margin-top:1rem" onclick="location.href='courses.html'">Browse Courses</button>
      </div>`;
        return;
    }
    let filtered = certificates;
    if (filter === 'recent') {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        filtered = certificates.filter(c => new Date(c.issuedDate).getTime() > thirtyDaysAgo);
    }
    filtered.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
    container.innerHTML = filtered.map(cert => `
    <div class="certificate-card" onclick="viewCertificate('${cert.id}')">
      <div class="certificate-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      </div>
      <div class="certificate-content">
        <div class="certificate-title">${escHtml(cert.courseName || 'Course')}</div>
        <div class="certificate-meta">
          <span>${escHtml(cert.instructor)}</span>
          <span>•</span>
          <span>${formatDate(cert.issuedDate)}</span>
        </div>
        <div class="certificate-id">ID: ${escHtml(cert.id)}</div>
      </div>
      <div class="certificate-actions">
        <button class="btn btn-ghost btn-icon" onclick="event.stopPropagation();downloadCertificate('${cert.id}')" title="Download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>`).join('');
}
function viewCertificate(certId) {
    const cert = certificates.find(c => c.id === certId);
    if (!cert) return;
    setText('cert-course-name',   cert.courseName || 'Course');
    setText('cert-student-name',  cert.studentName);
    setText('cert-date',          formatDate(cert.issuedDate));
    setText('cert-id',            cert.id);
    setText('cert-instructor',    cert.instructor);
    $id('download-cert-btn').onclick = () => downloadCertificate(certId);
    openModal('cert-modal');
}
function downloadCertificate(certId) {
    const cert = certificates.find(c => c.id === certId);
    if (!cert) return;
    toast({ title: 'Download Started', desc: `Downloading certificate for ${cert.courseName}` });
}
window.viewCertificate     = viewCertificate;
window.downloadCertificate = downloadCertificate;
$id('filter-all').onclick = () => {
    $id('filter-all').className    = 'btn btn-outline btn-sm';
    $id('filter-recent').className = 'btn btn-ghost btn-sm';
    renderCertificates('all');
};
$id('filter-recent').onclick = () => {
    $id('filter-all').className    = 'btn btn-ghost btn-sm';
    $id('filter-recent').className = 'btn btn-outline btn-sm';
    renderCertificates('recent');
};
loadData();
